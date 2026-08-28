# Prez configuration

The endpoint and profile definitions under `config/` are copied into the Prez API
image by the repository's root `Dockerfile`.

Keep these as ordinary repository files rather than absolute symlinks so builds are
self-contained and work outside the original development checkout.
