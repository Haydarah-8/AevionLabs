import { describe, expect, it } from "vitest";
import { PuckEngine } from "@/lib/editor/puck-engine";
import { emptyPuck } from "@/features/website-factory/types";
import {
  fromAevionDocument,
  toAevionDocument,
  toEditablePuckData,
} from "@/lib/editor/editor-serializer";

describe("PuckEngine", () => {
  it("adds, updates, duplicates, moves, and removes components", async () => {
    const engine = PuckEngine.fromPuckData(emptyPuck(), {
      id: "page-1",
      name: "home",
      title: "Home",
    });

    await engine.addComponent({
      id: "a",
      type: "Hero",
      props: { heading: "Hello" },
    });
    await engine.addComponent({
      id: "b",
      type: "Services",
      props: { heading: "Work" },
    });

    expect(engine.getPuckData().content).toHaveLength(2);

    await engine.updateComponent("a", { heading: "Hi" });
    expect(engine.getPuckData().content[0].props.heading).toBe("Hi");

    await engine.duplicateComponent("a");
    expect(engine.getPuckData().content).toHaveLength(3);

    await engine.moveComponent("b", { parentId: null, index: 0 });
    expect(engine.getPuckData().content[0].props.id).toBe("b");

    await engine.removeComponent("b");
    expect(
      engine.getPuckData().content.find((n) => n.props.id === "b"),
    ).toBeUndefined();
  });

  it("supports undo and redo", async () => {
    const engine = PuckEngine.fromPuckData(emptyPuck());
    await engine.addComponent({
      id: "x",
      type: "Heading",
      props: { text: "One" },
    });
    await engine.addComponent({
      id: "y",
      type: "Heading",
      props: { text: "Two" },
    });
    expect(engine.getPuckData().content).toHaveLength(2);
    await engine.undo();
    expect(engine.getPuckData().content).toHaveLength(1);
    await engine.redo();
    expect(engine.getPuckData().content).toHaveLength(2);
  });

  it("round-trips through Aevion documents as puck only", () => {
    const puck = {
      root: { props: { title: "Home" } },
      content: [{ type: "Hero", props: { id: "1", heading: "A" } }],
    };
    const doc = toAevionDocument(puck);
    expect(doc.engine).toBe("puck");
    expect(fromAevionDocument(doc)).toEqual(puck);
    expect(toEditablePuckData(doc.native as never)).toEqual(puck);
  });

  it("normalizes grapes envelopes to empty puck for editing", () => {
    const grapes = {
      version: 1 as const,
      engine: "grapesjs" as const,
      title: "Old",
      native: { project: {}, html: "<p>x</p>", css: "" },
    };
    const doc = toAevionDocument(grapes);
    expect(doc.engine).toBe("puck");
    expect(toEditablePuckData(fromAevionDocument(doc)).content).toEqual([]);
  });
});
