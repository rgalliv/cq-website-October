# CQ Website - October

CraneQualified website and CRM form developer handoff, October 12, 2026.

## October 14 messaging review

This review branch updates the homepage and shared footer to explain specialist
crane and rigging workforce development, company-run delivery or proposed
managed coordination. Learning, supervised practice, observed competence,
external certification and employer authorization remain separate. Specialist
instruction, site visits, evaluations and certification fees need separate scope.

The review-draft employer overview is at
`website/dist/downloads/employer-overview.pdf`, with editable text under `docs/`.
No new price or capacity limits are published. This source package has not been
installed on production WordPress or released by this review.

The page generator now rebuilds the handoff even when the optional private
hosting manifest is absent. It does not create hosting configuration. Asset,
form and plugin files remain unchanged; `MANIFEST.json` records the revised
marketing-file hashes and preserves the original source references.

## Download

Use **Code > Download ZIP**, or [download the complete repository](https://github.com/rgalliv/cq-website-October/archive/refs/heads/main.zip).

## Included files

- `website/build_pages.py`: website page generator.
- `website/dist/`: website HTML, CSS, JavaScript, images and fonts.
- `forms/crm-forms.zip`: installable WordPress CRM Forms 1.1.0 plugin.
- `forms/`: standalone form renderer, endpoint configuration and integration example.
- `licenses/`: included font license notices.
- `MANIFEST.json`: file hashes and original source commit references.

This is a static website source package, not a WordPress theme. The separately referenced `CraneQualified-Website-and-CRM-Developer-Handoff.md` was not included in the supplied ZIP.

## View locally

From the repository folder:

```sh
python -m http.server 8765 --bind 127.0.0.1 --directory website/dist
```

Open `http://127.0.0.1:8765`. Rebuild pages with `python website/build_pages.py`.

**The website and example form connect to the live CraneQualified CRM. Do not submit test inquiries to production; mock submissions for offline testing.** The plugin is supplied as a developer handoff; its presence here does not mean it has been installed on production WordPress.

## Provenance and distribution

Imported from `CraneQualified-Developer-Source-Package.zip` at the owner's request for public developer sharing. The original handoff lineage is retained. This review revises marketing copy and adds an employer document; form code, plugin archive, assets and license notices remain unchanged from that package. `MANIFEST.json` reflects the review files and updated hashes.

Public availability does not grant a blanket license to the website, branding or photographs. Retain the included font notices and the plugin's GPL notices. See `README.txt` for the original source references and asset provenance.
