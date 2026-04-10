# Open Logic Migration Checklist

## Completed In Repo

- Active brand copy updated from the legacy brand to `Open Logic`
- Chinese name kept as `源问`
- Shared bilingual lockup standardized to `Open Logic 源问`
- Navigation badge updated from `OS` to `OL`
- Workspace asset filenames renamed where safe
- Local SQLite filename updated to `openlogic.db`

## Approved Compatibility Exceptions

- `routes/comments.py` keeps `@AI` and `@源问AI`
- `services/ai_service.py` keeps the assistant persona name `源问AI`

## Manual Follow-Up Outside This Repo

- Rename the current workspace folder so it also uses the new brand
- Rename the remote GitHub repository and update its description
- Update deployment project names, service labels, and dashboards
- Regenerate PDF deliverables so their internal content also uses `Open Logic`
- Review seeded data, historical posts, exports, and screenshots for old-brand residue
- Decide whether future product direction needs branded AI mention aliases such as `@OpenLogic`
