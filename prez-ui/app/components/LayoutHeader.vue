<template>
  <header class="bg-tertiary text-tertiary-foreground h-32">
    <div class="container mx-auto px-4 h-full flex justify-between items-center">
      <NuxtLink to="/" class="text-4xl hidden md:block">
        <slot name="logo">
          <div class="flex flex-row gap-3 items-center">
            <img src="/prez-logo.png" alt="OSPD Demo logo" class="w-[60px]">
            <span>OSPD Demo</span>
          </div>
        </slot>
      </NuxtLink>
    </div>
  </header>
</template>
