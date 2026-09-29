import { create } from "zustand";
import { temporal } from "zundo";
import {
  type ResumeData,
  type ResumeTheme,
  type Basics,
  type Profile,
  type Section,
  type SectionType,
} from "@/lib/resume/schema";
import {
  newSectionOfType,
  blankItem,
  blankResumeData,
  defaultTheme,
} from "@/lib/resume/defaults";
import { nanoid } from "nanoid";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

interface EditorState {
  id: string;
  title: string;
  template: string;
  data: ResumeData;
  theme: ResumeTheme;
  status: SaveStatus;
  lastSavedAt?: string;
  activeSectionId?: string;

  init: (p: {
    id: string;
    title: string;
    template: string;
    data: ResumeData;
    theme: ResumeTheme;
  }) => void;

  setStatus: (s: SaveStatus) => void;
  markSaved: (at: string) => void;
  setActiveSection: (id?: string) => void;

  setTitle: (t: string) => void;
  setTemplate: (t: string) => void;
  patchTheme: (p: Partial<ResumeTheme>) => void;
  replaceContent: (p: {
    data: ResumeData;
    theme?: ResumeTheme;
    template?: string;
  }) => void;

  patchBasics: (p: Partial<Basics>) => void;
  addProfile: () => void;
  updateProfile: (id: string, p: Partial<Profile>) => void;
  removeProfile: (id: string) => void;

  addSection: (type: SectionType) => void;
  removeSection: (id: string) => void;
  patchSection: (id: string, p: Partial<Section>) => void;
  toggleSection: (id: string) => void;
  reorderSections: (activeId: string, overId: string) => void;

  addKeywordToSkills: (term: string) => void;
  addItem: (sectionId: string, type: SectionType) => void;
  updateItem: (
    sectionId: string,
    itemId: string,
    p: Record<string, unknown>
  ) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  reorderItems: (sectionId: string, activeId: string, overId: string) => void;
}

function reorder<T>(list: T[], fromId: string, toId: string, idOf: (x: T) => string): T[] {
  const from = list.findIndex((x) => idOf(x) === fromId);
  const to = list.findIndex((x) => idOf(x) === toId);
  if (from === -1 || to === -1 || from === to) return list;
  const copy = [...list];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

export const useEditorStore = create<EditorState>()(
  temporal(
    (set) => {
      // Any content mutation flips status to "dirty" so autosave fires.
      const dirty = (patch: Partial<EditorState>): Partial<EditorState> => ({
        ...patch,
        status: "dirty",
      });

      return {
    id: "",
    title: "",
    template: "modern",
    data: blankResumeData(),
    theme: defaultTheme(),
    status: "idle",

    init: (p) =>
      set({
        id: p.id,
        title: p.title,
        template: p.template,
        data: p.data,
        theme: p.theme,
        status: "idle",
        activeSectionId: p.data.sections[0]?.id,
      }),

    setStatus: (status) => set({ status }),
    markSaved: (at) => set({ status: "saved", lastSavedAt: at }),
    setActiveSection: (activeSectionId) => set({ activeSectionId }),

    setTitle: (title) => set(dirty({ title })),
    setTemplate: (template) => set(dirty({ template })),
    patchTheme: (p) => set((s) => dirty({ theme: { ...s.theme, ...p } })),
    replaceContent: (p) =>
      set((s) =>
        dirty({
          data: p.data,
          theme: p.theme ?? s.theme,
          template: p.template ?? s.template,
          activeSectionId: p.data.sections[0]?.id,
        })
      ),

    patchBasics: (p) =>
      set((s) => dirty({ data: { ...s.data, basics: { ...s.data.basics, ...p } } })),

    addProfile: () =>
      set((s) =>
        dirty({
          data: {
            ...s.data,
            basics: {
              ...s.data.basics,
              profiles: [
                ...s.data.basics.profiles,
                { id: nanoid(8), network: "", username: "", url: "" },
              ],
            },
          },
        })
      ),
    updateProfile: (id, p) =>
      set((s) =>
        dirty({
          data: {
            ...s.data,
            basics: {
              ...s.data.basics,
              profiles: s.data.basics.profiles.map((pr) =>
                pr.id === id ? { ...pr, ...p } : pr
              ),
            },
          },
        })
      ),
    removeProfile: (id) =>
      set((s) =>
        dirty({
          data: {
            ...s.data,
            basics: {
              ...s.data.basics,
              profiles: s.data.basics.profiles.filter((pr) => pr.id !== id),
            },
          },
        })
      ),

    addSection: (type) =>
      set((s) => {
        const section = newSectionOfType(type);
        return dirty({
          data: { ...s.data, sections: [...s.data.sections, section] },
          activeSectionId: section.id,
        });
      }),
    removeSection: (id) =>
      set((s) =>
        dirty({
          data: { ...s.data, sections: s.data.sections.filter((x) => x.id !== id) },
        })
      ),
    patchSection: (id, p) =>
      set((s) =>
        dirty({
          data: {
            ...s.data,
            sections: s.data.sections.map((x) => (x.id === id ? { ...x, ...p } : x)),
          },
        })
      ),
    toggleSection: (id) =>
      set((s) =>
        dirty({
          data: {
            ...s.data,
            sections: s.data.sections.map((x) =>
              x.id === id ? { ...x, visible: !x.visible } : x
            ),
          },
        })
      ),
    reorderSections: (activeId, overId) =>
      set((s) =>
        dirty({
          data: {
            ...s.data,
            sections: reorder(s.data.sections, activeId, overId, (x) => x.id),
          },
        })
      ),

    addKeywordToSkills: (term) =>
      set((s) => {
        const keyword = term.trim();
        if (!keyword) return {};
        const sections = [...s.data.sections];
        const skillsIndex = sections.findIndex((sec) => sec.type === "skills");

        if (skillsIndex === -1) {
          const section = newSectionOfType("skills");
          section.items = [
            { id: nanoid(8), name: "Targeted skills", level: 0, keywords: [keyword] },
          ];
          return dirty({
            data: { ...s.data, sections: [...sections, section] },
          });
        }

        const section = sections[skillsIndex];
        const items = section.items.length
          ? [...section.items]
          : [{ id: nanoid(8), name: "", level: 0, keywords: [] as string[] }];
        const first = items[0] as { keywords?: string[] };
        const existing = (first.keywords ?? []).map((k) => k.toLowerCase());
        if (!existing.includes(keyword.toLowerCase())) {
          items[0] = { ...first, keywords: [...(first.keywords ?? []), keyword] };
        }
        sections[skillsIndex] = { ...section, items };
        return dirty({ data: { ...s.data, sections } });
      }),

    addItem: (sectionId, type) =>
      set((s) =>
        dirty({
          data: {
            ...s.data,
            sections: s.data.sections.map((sec) =>
              sec.id === sectionId
                ? { ...sec, items: [...sec.items, blankItem(type)] }
                : sec
            ),
          },
        })
      ),
    updateItem: (sectionId, itemId, p) =>
      set((s) =>
        dirty({
          data: {
            ...s.data,
            sections: s.data.sections.map((sec) =>
              sec.id === sectionId
                ? {
                    ...sec,
                    items: sec.items.map((it) =>
                      (it as { id: string }).id === itemId ? { ...it, ...p } : it
                    ),
                  }
                : sec
            ),
          },
        })
      ),
    removeItem: (sectionId, itemId) =>
      set((s) =>
        dirty({
          data: {
            ...s.data,
            sections: s.data.sections.map((sec) =>
              sec.id === sectionId
                ? {
                    ...sec,
                    items: sec.items.filter(
                      (it) => (it as { id: string }).id !== itemId
                    ),
                  }
                : sec
            ),
          },
        })
      ),
    reorderItems: (sectionId, activeId, overId) =>
      set((s) =>
        dirty({
          data: {
            ...s.data,
            sections: s.data.sections.map((sec) =>
              sec.id === sectionId
                ? {
                    ...sec,
                    items: reorder(
                      sec.items,
                      activeId,
                      overId,
                      (x) => (x as { id: string }).id
                    ),
                  }
                : sec
            ),
          },
        })
      ),
      };
    },
    {
      // Track only resume content for undo/redo (not status/active section).
      limit: 100,
      partialize: (state) => ({
        data: state.data,
        theme: state.theme,
        template: state.template,
        title: state.title,
      }),
      // Group rapid edits (typing) into a single undo step via a leading throttle.
      handleSet: (handleSet) => {
        let last = 0;
        return (pastState) => {
          const now = Date.now();
          if (now - last > 600) {
            last = now;
            handleSet(pastState);
          }
        };
      },
    }
  )
);
