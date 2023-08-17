1. change the button id system to include `role` like `role:politics` or `role:pronouns:she_her`
    - only handle roles if the id of the button has the `role` prefix. This will help prevent unhandled buttons from trying to assign a role and instead, skipping all subprocesses.
2. refactor the folder structure to contain `utils` and `models` in both `server` and `client` with the relevant utilities being in each folder respectively.
    - requires less relative folder traversing like `../../../utils`
3. 