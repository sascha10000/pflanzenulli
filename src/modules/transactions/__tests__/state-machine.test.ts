import { describe, expect, it } from "vitest";
import {
  transition,
  getAvailableEvents,
  type TransitionContext,
} from "../state-machine";

const ctx: TransitionContext = {
  transactionId: "tx-1",
  listingId: "lst-1",
  buyerId: "buyer-1",
  sellerId: "seller-1",
  transactionType: "buy",
};

const tradeCtx: TransitionContext = { ...ctx, transactionType: "trade" };

describe("transaction state machine", () => {
  // --- Happy path ---
  describe("happy path (buy)", () => {
    it("pending -> accepted (seller accepts)", () => {
      const result = transition("pending_acceptance", "ACCEPT", "seller", ctx);
      expect(result.newState).toBe("accepted");
    });

    it("accepted -> address_exchanged (system)", () => {
      const result = transition(
        "accepted",
        "ADDRESSES_EXCHANGED",
        "system",
        ctx,
      );
      expect(result.newState).toBe("address_exchanged");
    });

    it("address_exchanged -> shipping_claimed (seller)", () => {
      const result = transition(
        "address_exchanged",
        "CLAIM_SHIPPED",
        "seller",
        ctx,
      );
      expect(result.newState).toBe("shipping_claimed");
    });

    it("shipping_claimed -> received_confirmed (buyer)", () => {
      const result = transition(
        "shipping_claimed",
        "CONFIRM_RECEIVED",
        "buyer",
        ctx,
      );
      expect(result.newState).toBe("received_confirmed");
    });

    it("received_confirmed -> completed (system)", () => {
      const result = transition(
        "received_confirmed",
        "COMPLETE",
        "system",
        ctx,
      );
      expect(result.newState).toBe("completed");
    });
  });

  // --- Side effects ---
  describe("side effects", () => {
    it("awards 50 sprouts each for buy transactions", () => {
      const result = transition(
        "shipping_claimed",
        "CONFIRM_RECEIVED",
        "buyer",
        ctx,
      );
      const sproutEffects = result.sideEffects.filter(
        (e) => e.type === "AWARD_SPROUTS",
      );
      expect(sproutEffects).toHaveLength(2);
      expect(sproutEffects[0]).toMatchObject({
        userId: "buyer-1",
        amount: 50,
      });
      expect(sproutEffects[1]).toMatchObject({
        userId: "seller-1",
        amount: 50,
      });
    });

    it("awards 75 sprouts each for trade transactions", () => {
      const result = transition(
        "shipping_claimed",
        "CONFIRM_RECEIVED",
        "buyer",
        tradeCtx,
      );
      const sproutEffects = result.sideEffects.filter(
        (e) => e.type === "AWARD_SPROUTS",
      );
      expect(sproutEffects[0]).toMatchObject({ amount: 75 });
      expect(sproutEffects[1]).toMatchObject({ amount: 75 });
    });

    it("schedules address deletion on confirm received", () => {
      const result = transition(
        "shipping_claimed",
        "CONFIRM_RECEIVED",
        "buyer",
        ctx,
      );
      const deleteEffects = result.sideEffects.filter(
        (e) => e.type === "SCHEDULE_ADDRESS_DELETION",
      );
      expect(deleteEffects).toHaveLength(1);
    });

    it("updates listing to sold on confirm received", () => {
      const result = transition(
        "shipping_claimed",
        "CONFIRM_RECEIVED",
        "buyer",
        ctx,
      );
      const listingEffects = result.sideEffects.filter(
        (e) => e.type === "UPDATE_LISTING_STATUS",
      );
      expect(listingEffects).toHaveLength(1);
      expect(listingEffects[0]).toMatchObject({ status: "sold" });
    });

    it("restores listing to active on cancellation", () => {
      const result = transition(
        "pending_acceptance",
        "CANCEL",
        "buyer",
        ctx,
      );
      const listingEffects = result.sideEffects.filter(
        (e) => e.type === "UPDATE_LISTING_STATUS",
      );
      expect(listingEffects[0]).toMatchObject({ status: "active" });
    });
  });

  // --- Cancellations ---
  describe("cancellations", () => {
    it("buyer can cancel pending", () => {
      const result = transition(
        "pending_acceptance",
        "CANCEL",
        "buyer",
        ctx,
      );
      expect(result.newState).toBe("cancelled");
    });

    it("seller can cancel pending", () => {
      const result = transition(
        "pending_acceptance",
        "CANCEL",
        "seller",
        ctx,
      );
      expect(result.newState).toBe("cancelled");
    });

    it("either party can cancel accepted", () => {
      expect(
        transition("accepted", "CANCEL", "buyer", ctx).newState,
      ).toBe("cancelled");
      expect(
        transition("accepted", "CANCEL", "seller", ctx).newState,
      ).toBe("cancelled");
    });
  });

  // --- Disputes ---
  describe("disputes", () => {
    it("buyer can dispute from accepted", () => {
      const result = transition("accepted", "DISPUTE", "buyer", ctx);
      expect(result.newState).toBe("disputed");
    });

    it("seller can dispute from shipping_claimed", () => {
      const result = transition("shipping_claimed", "DISPUTE", "seller", ctx);
      expect(result.newState).toBe("disputed");
    });

    it("admin can resolve dispute to completed", () => {
      const result = transition("disputed", "RESOLVE_COMPLETE", "admin", ctx);
      expect(result.newState).toBe("completed");
    });

    it("admin can resolve dispute to cancelled", () => {
      const result = transition("disputed", "RESOLVE_CANCEL", "admin", ctx);
      expect(result.newState).toBe("cancelled");
    });
  });

  // --- Invalid transitions ---
  describe("invalid transitions", () => {
    it("throws on invalid event for state", () => {
      expect(() =>
        transition("completed", "CANCEL", "buyer", ctx),
      ).toThrow("Invalid transition");
    });

    it("throws when buyer tries to accept", () => {
      expect(() =>
        transition("pending_acceptance", "ACCEPT", "buyer", ctx),
      ).toThrow("not allowed");
    });

    it("throws when seller tries to confirm received", () => {
      expect(() =>
        transition("shipping_claimed", "CONFIRM_RECEIVED", "seller", ctx),
      ).toThrow("not allowed");
    });

    it("throws on already completed", () => {
      expect(() =>
        transition("completed", "DISPUTE", "buyer", ctx),
      ).toThrow("Invalid transition");
    });

    it("throws on already cancelled", () => {
      expect(() =>
        transition("cancelled", "ACCEPT", "seller", ctx),
      ).toThrow("Invalid transition");
    });
  });

  // --- Available events ---
  describe("getAvailableEvents", () => {
    it("seller can accept or reject pending", () => {
      const events = getAvailableEvents("pending_acceptance", "seller");
      expect(events).toContain("ACCEPT");
      expect(events).toContain("REJECT");
      expect(events).toContain("CANCEL");
    });

    it("buyer can only cancel pending", () => {
      const events = getAvailableEvents("pending_acceptance", "buyer");
      expect(events).toContain("CANCEL");
      expect(events).not.toContain("ACCEPT");
    });

    it("no events available in completed state", () => {
      const events = getAvailableEvents("completed", "buyer");
      expect(events).toHaveLength(0);
    });
  });
});
