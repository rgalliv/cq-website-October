CraneQualified developer source package - October 12, 2026

See README.md for repository download and setup instructions. The separately
referenced CraneQualified-Website-and-CRM-Developer-Handoff.md was not included
in the supplied archive.
website/ contains the exact published website source and static output from
Site source commit 008034aac01a52279e8e6f3935b6116fdd528538. This is not a WordPress theme ZIP.
forms/crm-forms.zip is the installable WordPress CRM Forms 1.1.0 package from
CRM draft PR16 commit b11f7195c76fdb1645bc1e525cca40c3f975c4bd. It has not been installed on production WordPress.
forms/standard-form-example.html is a minimal standard website embed example.
Both website and form example point to the LIVE CQ CRM. Reading pages is safe;
do not submit test data without approval. Offline testing must mock POST.
The package was reviewed for credential and private-record exposure. No
access-granting credentials or private lead records were identified in that
bounded review; this is not a guarantee against every possible hidden secret.
Source archive and preview remain separate from production.

Run website locally from this folder:
  python -m http.server 8765 --bind 127.0.0.1 --directory website/dist
Rebuild static HTML with:
  python website/build_pages.py
The standard form example may be served separately from forms/ using localhost.
Web Crypto needs HTTPS or localhost. See the handoff for CSP, privacy, consent,
retry identity, portal routing and content migration requirements.

Logo and three photographs were copied unchanged from the owner's existing
https://www.cranequalified.com/ on October 12, 2026. Original licensing paperwork
was not available; public availability alone is not a license. Confirm the
owner's rights for the final website. Retain original branding and image context.
Barlow Condensed and Inter were downloaded from Google Fonts; their SIL Open Font
License texts are included. Retain these notices when redistributing the fonts.

Package revision: documentation-only privacy minimization, October 12, 2026.
Pinned source commits identify unchanged implementation code/assets. README
and MANIFEST metadata were updated; the outer archive hash has changed.

Access and confidentiality:
This self-contained website/form package does not require the owner's general
account access, CRM administration, database access or email-provider secrets.
Use only owner-approved, narrowly scoped website staging access. Private GitHub
references in the handoff grant no access; repository access is a separate
owner decision if the assigned work requires it. Public form URLs and slugs
are integration identifiers, not administrator credentials.
The owner requested public developer sharing through cq-website-October on
October 12, 2026, superseding the original private-handoff distribution note.
Public access does not grant a blanket license to branding or photographs.
Retain the included font license notices.
