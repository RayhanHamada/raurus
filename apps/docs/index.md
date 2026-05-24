---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
    name: "Raurus"
    text: "Inline image editing without handing your UI to a CMS"
    tagline: A lightweight runtime and React integration for editable web assets with local storage, SQLite metadata, and permission-aware edit mode.
    actions:
        - theme: brand
          text: API Examples
          link: /api-examples
        - theme: alt
          text: GitHub Repository
          link: https://github.com/RayhanHamada/raurus

features:
    - title: Runtime-first design
      details: Keep storage, permissions, validation, and metadata orchestration in a small framework-agnostic runtime.
    - title: Thin React layer
      details: Wrap images with `EditableAsset`, provide a runtime with `RaurusProvider`, and keep normal rendering untouched outside edit mode.
    - title: Practical V0 workflow
      details: Use the local filesystem, SQLite metadata, and a simple permission adapter to prove inline asset editing end to end.
---
