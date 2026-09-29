"use client";

import { useRef } from "react";
import { Plus, Trash2, User, Upload } from "lucide-react";
import { useEditorStore } from "@/lib/editor/store";
import { Field, Input, Textarea } from "@/components/ui";

/** Downscale an uploaded image to a square-ish max dimension and return a JPEG data URL. */
async function toResizedDataUrl(file: File, max = 400): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function BasicsEditor() {
  const basics = useEditorStore((s) => s.data.basics);
  const patchBasics = useEditorStore((s) => s.patchBasics);
  const addProfile = useEditorStore((s) => s.addProfile);
  const updateProfile = useEditorStore((s) => s.updateProfile);
  const removeProfile = useEditorStore((s) => s.removeProfile);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const url = await toResizedDataUrl(file);
      patchBasics({ photo: url });
    } catch {
      // ignore unreadable images
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <User className="h-4 w-4 text-slate-400" />
        Personal details
      </div>

      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
          {basics.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={basics.photo} alt="Headshot" className="h-full w-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-slate-300" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Upload className="h-4 w-4" /> {basics.photo ? "Replace photo" : "Upload photo"}
          </button>
          {basics.photo && (
            <button
              type="button"
              onClick={() => patchBasics({ photo: "" })}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Remove photo"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Full name" className="col-span-2">
          <Input
            value={basics.fullName}
            onChange={(e) => patchBasics({ fullName: e.target.value })}
            placeholder="Ada Lovelace"
          />
        </Field>
        <Field label="Headline" className="col-span-2">
          <Input
            value={basics.headline}
            onChange={(e) => patchBasics({ headline: e.target.value })}
            placeholder="Senior Software Engineer"
          />
        </Field>
        <Field label="Email">
          <Input
            value={basics.email}
            onChange={(e) => patchBasics({ email: e.target.value })}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Phone">
          <Input
            value={basics.phone}
            onChange={(e) => patchBasics({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </Field>
        <Field label="Location">
          <Input
            value={basics.location}
            onChange={(e) => patchBasics({ location: e.target.value })}
            placeholder="City, Country"
          />
        </Field>
        <Field label="Website">
          <Input
            value={basics.website}
            onChange={(e) => patchBasics({ website: e.target.value })}
            placeholder="yoursite.com"
          />
        </Field>
      </div>

      <Field label="Short summary (optional headline blurb)">
        <Textarea
          rows={3}
          value={basics.summary}
          onChange={(e) => patchBasics({ summary: e.target.value })}
          placeholder="One or two sentences about who you are. (You can also use the Summary section.)"
        />
      </Field>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">
            Profiles / links
          </span>
          <button
            type="button"
            onClick={addProfile}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {basics.profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <Input
                value={p.network}
                onChange={(e) => updateProfile(p.id, { network: e.target.value })}
                placeholder="LinkedIn"
                className="w-32"
              />
              <Input
                value={p.url}
                onChange={(e) => updateProfile(p.id, { url: e.target.value })}
                placeholder="linkedin.com/in/you"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeProfile(p.id)}
                className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Remove profile"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
