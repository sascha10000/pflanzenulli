/**
 * Transaction state machine.
 *
 * Pure function: no side effects, no database access.
 * Returns the new state and a list of side effects to be executed by the caller.
 */

export type TransactionState =
  | "pending_acceptance"
  | "accepted"
  | "address_exchanged"
  | "shipping_claimed"
  | "received_confirmed"
  | "completed"
  | "disputed"
  | "cancelled"
  | "expired";

export type TransactionEvent =
  | "ACCEPT"
  | "REJECT"
  | "CANCEL"
  | "ADDRESSES_EXCHANGED"
  | "CLAIM_SHIPPED"
  | "CONFIRM_RECEIVED"
  | "COMPLETE"
  | "DISPUTE"
  | "RESOLVE_COMPLETE"
  | "RESOLVE_CANCEL"
  | "EXPIRE";

export type ActorRole = "buyer" | "seller" | "system" | "admin";

export type SideEffect =
  | { type: "AWARD_SPROUTS"; userId: string; amount: number; reason: string }
  | { type: "SEND_NOTIFICATION"; userId: string; template: string; data?: Record<string, string> }
  | { type: "SCHEDULE_ADDRESS_DELETION"; transactionId: string; deleteAt: Date }
  | { type: "UPDATE_LISTING_STATUS"; listingId: string; status: string }
  | { type: "LOG_AUDIT"; action: string; metadata?: Record<string, string> };

export interface TransitionContext {
  transactionId: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  transactionType: "buy" | "trade";
}

export interface TransitionResult {
  newState: TransactionState;
  sideEffects: SideEffect[];
}

type TransitionMap = Partial<
  Record<
    TransactionEvent,
    {
      allowedActors: ActorRole[];
      newState: TransactionState;
      getSideEffects?: (ctx: TransitionContext) => SideEffect[];
    }
  >
>;

const TRANSITIONS: Record<TransactionState, TransitionMap> = {
  pending_acceptance: {
    ACCEPT: {
      allowedActors: ["seller"],
      newState: "accepted",
      getSideEffects: (ctx) => [
        {
          type: "SEND_NOTIFICATION",
          userId: ctx.buyerId,
          template: "transaction_accepted",
        },
      ],
    },
    REJECT: {
      allowedActors: ["seller"],
      newState: "cancelled",
      getSideEffects: (ctx) => [
        {
          type: "UPDATE_LISTING_STATUS",
          listingId: ctx.listingId,
          status: "active",
        },
        {
          type: "SEND_NOTIFICATION",
          userId: ctx.buyerId,
          template: "transaction_rejected",
        },
      ],
    },
    CANCEL: {
      allowedActors: ["buyer", "seller"],
      newState: "cancelled",
      getSideEffects: (ctx) => [
        {
          type: "UPDATE_LISTING_STATUS",
          listingId: ctx.listingId,
          status: "active",
        },
      ],
    },
    EXPIRE: {
      allowedActors: ["system"],
      newState: "expired",
      getSideEffects: (ctx) => [
        {
          type: "UPDATE_LISTING_STATUS",
          listingId: ctx.listingId,
          status: "active",
        },
      ],
    },
  },

  accepted: {
    ADDRESSES_EXCHANGED: {
      allowedActors: ["system"],
      newState: "address_exchanged",
    },
    CANCEL: {
      allowedActors: ["buyer", "seller"],
      newState: "cancelled",
      getSideEffects: (ctx) => [
        {
          type: "UPDATE_LISTING_STATUS",
          listingId: ctx.listingId,
          status: "active",
        },
      ],
    },
    DISPUTE: {
      allowedActors: ["buyer", "seller"],
      newState: "disputed",
    },
  },

  address_exchanged: {
    CLAIM_SHIPPED: {
      allowedActors: ["seller"],
      newState: "shipping_claimed",
      getSideEffects: (ctx) => [
        {
          type: "SEND_NOTIFICATION",
          userId: ctx.buyerId,
          template: "shipping_claimed",
        },
      ],
    },
    DISPUTE: {
      allowedActors: ["buyer", "seller"],
      newState: "disputed",
    },
    CANCEL: {
      allowedActors: ["buyer", "seller"],
      newState: "cancelled",
      getSideEffects: (ctx) => [
        {
          type: "UPDATE_LISTING_STATUS",
          listingId: ctx.listingId,
          status: "active",
        },
      ],
    },
  },

  shipping_claimed: {
    CONFIRM_RECEIVED: {
      allowedActors: ["buyer"],
      newState: "received_confirmed",
      getSideEffects: (ctx) => {
        const sproutAmount = ctx.transactionType === "trade" ? 75 : 50;
        const deleteAt = new Date();
        deleteAt.setDate(deleteAt.getDate() + 30);
        return [
          {
            type: "AWARD_SPROUTS",
            userId: ctx.buyerId,
            amount: sproutAmount,
            reason: `${ctx.transactionType}_completed`,
          },
          {
            type: "AWARD_SPROUTS",
            userId: ctx.sellerId,
            amount: sproutAmount,
            reason: `${ctx.transactionType}_completed`,
          },
          {
            type: "UPDATE_LISTING_STATUS",
            listingId: ctx.listingId,
            status: "sold",
          },
          {
            type: "SCHEDULE_ADDRESS_DELETION",
            transactionId: ctx.transactionId,
            deleteAt,
          },
          {
            type: "SEND_NOTIFICATION",
            userId: ctx.sellerId,
            template: "received_confirmed",
          },
        ];
      },
    },
    DISPUTE: {
      allowedActors: ["buyer", "seller"],
      newState: "disputed",
    },
  },

  received_confirmed: {
    COMPLETE: {
      allowedActors: ["system"],
      newState: "completed",
    },
  },

  completed: {},

  disputed: {
    RESOLVE_COMPLETE: {
      allowedActors: ["admin"],
      newState: "completed",
      getSideEffects: () => [
        { type: "LOG_AUDIT", action: "dispute_resolved_complete" },
      ],
    },
    RESOLVE_CANCEL: {
      allowedActors: ["admin"],
      newState: "cancelled",
      getSideEffects: (ctx) => [
        {
          type: "UPDATE_LISTING_STATUS",
          listingId: ctx.listingId,
          status: "active",
        },
        { type: "LOG_AUDIT", action: "dispute_resolved_cancel" },
      ],
    },
  },

  cancelled: {},
  expired: {},
};

export function transition(
  currentState: TransactionState,
  event: TransactionEvent,
  actorRole: ActorRole,
  context: TransitionContext,
): TransitionResult {
  const stateTransitions = TRANSITIONS[currentState];
  const transitionDef = stateTransitions[event];

  if (!transitionDef) {
    throw new Error(
      `Invalid transition: cannot apply ${event} in state ${currentState}`,
    );
  }

  if (!transitionDef.allowedActors.includes(actorRole)) {
    throw new Error(
      `Actor role "${actorRole}" is not allowed to trigger ${event} in state ${currentState}`,
    );
  }

  const sideEffects = transitionDef.getSideEffects?.(context) ?? [];

  return {
    newState: transitionDef.newState,
    sideEffects,
  };
}

/**
 * Get the list of valid events for the current state and actor role.
 */
export function getAvailableEvents(
  currentState: TransactionState,
  actorRole: ActorRole,
): TransactionEvent[] {
  const stateTransitions = TRANSITIONS[currentState];
  const entries = Object.entries(stateTransitions) as Array<
    [string, { allowedActors: ActorRole[]; newState: TransactionState } | undefined]
  >;
  return entries
    .filter(([, def]) => def?.allowedActors.includes(actorRole))
    .map(([event]) => event as TransactionEvent);
}
