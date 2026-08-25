# Prez

Place a `Dockerfile` in this directory to override Prez' config. It should have the following content:

```
ARG PREZ_VERSION=latest
FROM ghcr.io/rdflib/prez:${PREZ_VERSION}

COPY config/ /tmp/prez-config/

# Resolve the installed Prez package location from the base image rather than
# hard-coding its Python version or site-packages path.
RUN config_dir="$(/opt/venv/bin/python -c \
    'import pathlib, prez.config; print(pathlib.Path(prez.config.__file__).parent / "config")')" \
    && cp -R /tmp/prez-config/. "${config_dir}/" \
    && rm -rf /tmp/prez-config
```

This will copy content from `config/` into the Prez image and override its config.
