# Mohammed Riyaz V — MEPF BIM Portfolio

An interactive portfolio for **Mohammed Riyaz V, Electrical Engineer & MEPF BIM Modeler**.

Built with HTML, CSS, JavaScript and Three.js. The site is static and does not require a backend or an external JavaScript CDN.

## Features

- A warehouse cutaway homepage with project hotspots.
- An interactive concept building with orbit, zoom, discipline isolation and an opening-building slider.
- Seven case studies covering warehouse MEP support, commercial electrical power, lighting layouts, villa electrical design, lighting visualisation, Dynamo and a personal home model.
- Project images, drawing evidence and downloadable PDFs.
- Responsive desktop and mobile layouts, accessible controls and reduced-motion support.
- Email and LinkedIn contact links.

## Run locally

From the repository root, start a static server:

```sh
python3 -m http.server 8000 --directory dist
```

On Windows, use `python` instead of `python3` if required. Open http://localhost:8000 in your browser. A local server is needed for JavaScript modules; opening the HTML file directly will not load the 3D explorer correctly.

## Files

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Homepage, profile and contact sections |
| `dist/style.css` | Responsive styling |
| `dist/app.js` | Case studies, filters, dialogs and interface controls |
| `dist/model.js` | Interactive concept building |
| `dist/assets/` | Images and downloadable project evidence |
| `dist/vendor/` | Locally bundled Three.js modules and its license |

## Edit the portfolio

Update the project array in `dist/app.js` to change the case studies. Update the profile and contact information in `dist/index.html`. Add new project assets under `dist/assets/`.

The opening warehouse visual is an illustrative generated concept. The interactive building is a procedural coordination study, not a Revit export. The gallery identifies actual project work and learning studies separately. An authorised GLB export can replace the procedural scene later.

The web portfolio PDF is a separate copy containing email and LinkedIn contact options; original source documents were preserved. Three.js 0.180.0 is pinned in `pnpm-lock.yaml`. Its MIT license is included in `dist/vendor/LICENSE-three.txt`.

## Hosting

Serve the contents of `dist/` using a static host. Adding this repository to GitHub does not enable GitHub Pages automatically.

The separately hosted portfolio is currently private and requires the owner's ChatGPT sign-in:
https://riyaz-mepf-inside-model.savorypaver1.chatgpt.site/
