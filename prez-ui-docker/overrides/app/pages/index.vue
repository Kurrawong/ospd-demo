<script setup>
</script>
<template>
  <NuxtLayout contentonly>
    <template #default>
      <div class="py-8 md:py-12">
        <section class="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-tertiary/10 p-6 shadow-sm md:p-10">
          <div class="max-w-4xl">
            <p class="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Open Science Persistent Demonstrator
            </p>
            <h1 class="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Distributed registers of Geoprocessing Activities
            </h1>
            <p class="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
              Explore registers of Geoprocessing Activities, the models and vocabularies that support their definition
              and the provenance needed to investigate their distributed governance.
            </p>

            <div class="mt-7 flex flex-wrap gap-3">
              <NuxtLink
                class="inline-flex items-center rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                to="/catalogs"
              >
                Explore the three catalogues
                <span class="ml-2" aria-hidden="true">→</span>
              </NuxtLink>
              <a
                class="inline-flex items-center rounded-lg border border-border bg-background/80 px-5 py-3 font-semibold text-foreground transition hover:bg-muted"
                href="https://ospd-demo-ld-client.whitebeach-741f0a68.australiaeast.azurecontainerapps.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open the Linked Data Client
                <span class="ml-2" aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>

        <section class="mt-10 grid gap-5 md:grid-cols-3" aria-label="Demonstrator overview">
          <article class="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p class="text-sm font-semibold text-primary">01 · Browse</p>
            <h2 class="mt-2 text-xl font-semibold">OGC Records catalogues</h2>
            <p class="mt-3 leading-6 text-muted-foreground">
              Navigate catalogues that follow the
              <a class="font-medium text-link underline underline-offset-4" href="https://ogcapi.ogc.org/records/">OGC API — Records</a>
              protocol.
            </p>
          </article>

          <article class="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p class="text-sm font-semibold text-primary">02 · Compare</p>
            <h2 class="mt-2 text-xl font-semibold">Distributed definitions</h2>
            <p class="mt-3 leading-6 text-muted-foreground">
              Follow three sub-registers in the
              <NuxtLink class="font-medium text-link underline underline-offset-4" to="/catalogs/demo:geoacs">Geoprocessing Activities Register</NuxtLink>
              to see how definitions relate across organisations.
            </p>
          </article>

          <article class="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p class="text-sm font-semibold text-primary">03 · Query</p>
            <h2 class="mt-2 text-xl font-semibold">Linked Data client</h2>
            <p class="mt-3 leading-6 text-muted-foreground">
              See the stand-alone <a class="font-medium text-link underline underline-offset-4" href="https://ospd-demo-ld-client.whitebeach-741f0a68.australiaeast.azurecontainerapps.io/">Linked Data Client</a> which currently traverses this catalogue's graph to assemble Register Owner information for Activity definitions and those they depend on.
            </p>
          </article>
        </section>

        <section class="mt-12 rounded-2xl bg-muted/60 p-6 md:p-8">
          <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.65fr)]">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Governance provenance</p>
              <h2 class="mt-2 text-2xl font-bold md:text-3xl">Two views of every Activity</h2>
              <p class="mt-4 leading-7 text-muted-foreground">
                Each geoprocessing activity has a <strong class="text-foreground">default</strong> profile containing
                core metadata and broader-definition relationships. Each also has a <strong class="text-foreground">GovProv</strong>
                profile focuses on governance status and links to the
                <NuxtLink
                  class="font-medium text-link underline underline-offset-4"
                  to="/catalogs/demo:vocs/collections/codeset:RegisterRolesDemo/items/regrols:register-owner"
                >
                  Register Owners
                </NuxtLink>
                responsible for those definitions.
              </p>
            </div>

            <aside class="rounded-xl border border-border bg-background p-5 shadow-sm" aria-labelledby="example-title">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Example activity</p>
              <h3 id="example-title" class="mt-1 text-lg font-semibold">Rapid River Detection</h3>
              <div class="mt-4 grid gap-3">
                <NuxtLink
                  class="rounded-lg border border-border px-4 py-3 font-medium transition hover:border-primary hover:bg-primary/5"
                  to="/catalogs/demo:geoacs/collections/demo:cro-geoacs/items/demo:rapid-river-detection"
                >
                  Default profile <span class="float-right" aria-hidden="true">→</span>
                </NuxtLink>
                <NuxtLink
                  class="rounded-lg border border-border px-4 py-3 font-medium transition hover:border-primary hover:bg-primary/5"
                  to="/catalogs/demo:geoacs/collections/demo:cro-geoacs/items/demo:rapid-river-detection?_profile=ns3:GeoAcGov"
                >
                  GovProv profile <span class="float-right" aria-hidden="true">→</span>
                </NuxtLink>
              </div>
            </aside>
          </div>
        </section>

        <section class="mt-12 border-t border-border pt-10">
          <div class="max-w-4xl">
            <p class="text-sm font-semibold uppercase tracking-[0.14em] text-primary">A distributed path</p>
            <h2 class="mt-2 text-2xl font-bold">From local graph traversal to linked registers</h2>
            <p class="mt-4 leading-7 text-muted-foreground">
              The current LD client walks this knowledge graph to find register owners. For example,
              <em class="text-foreground">Dissolve Grasslands</em> depends on both the Croatian Ministry of
              Environmental Protection and Green Transition, which defined it, and the Open Geospatial Consortium,
              which defines the broader <em class="text-foreground">Dissolve</em> activity.
            </p>
            <p class="mt-4 leading-7 text-muted-foreground">
              A v2 will follow links across the internet, visit distributed registers, and assemble the
              same governance picture from each Activity's GovProv profile.
            </p>
          </div>
        </section>
      </div>
    </template>
  </NuxtLayout>
</template>
