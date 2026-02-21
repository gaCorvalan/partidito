<template>
    <div
        class="flex items-center justify-center min-h-[100svh] min-h-[100dvh] bg-background md:items-stretch md:p-0"
    >
        <div
            class="w-full flex flex-col h-[100svh] h-[100dvh] md:h-[100dvh] md:max-w-xl bg-background rounded-3xl overflow-hidden shadow-2xl"
        >
            <div class="flex-1 overflow-y-auto">
                <slot />
            </div>
            <nav class="border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
                <div class="flex justify-around items-center">
                    <button
                        v-for="item in navItems"
                        :key="item.label"
                        @click="handleNavigate(item.route)"
                        :class="[
                            'flex-1 py-4 px-3 flex flex-col items-center justify-center gap-1',
                            isActive(item.route)
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground',
                        ]"
                    >
                        <Icon :name="item.icon" class="w-6 h-6" />
                        <span class="text-xs font-medium">{{ t(item.label) }}</span>
                    </button>
                </div>
            </nav>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { TranslationKey } from "~/i18n/locales/es";

interface NavItem {
    label: TranslationKey;
    route: string;
    icon: string;
}

const navItems: NavItem[] = [
    { label: "nav.home", route: "/", icon: "lucide:home" },
    { label: "nav.search", route: "/search", icon: "lucide:search" },
    { label: "nav.publish", route: "/create", icon: "lucide:plus" },
    { label: "nav.chats", route: "/chats", icon: "lucide:message-square" },
    { label: "nav.profile", route: "/profile", icon: "lucide:user" },
];

const route = useRoute();
const { t } = useI18n();

const isActive = (path: string) => {
    return route.path === path;
};

const handleNavigate = (path: string) => {
    navigateTo(path);
};
</script>
