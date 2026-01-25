<template>
    <div
        class="w-full max-w-xl flex flex-col h-screen bg-background rounded-3xl overflow-hidden shadow-2xl mx-auto"
    >
        <div class="flex-1 overflow-y-auto">
            <slot />
        </div>
        <nav class="border-t border-border bg-background">
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
                    <span class="text-xs font-medium">{{ item.label }}</span>
                </button>
            </div>
        </nav>
    </div>
</template>

<script setup lang="ts">
interface NavItem {
    label: string;
    route: string;
    icon: string;
}

const navItems: NavItem[] = [
    { label: "Home", route: "/", icon: "lucide:home" },
    { label: "Search", route: "/search", icon: "lucide:search" },
    { label: "Publish", route: "/create", icon: "lucide:plus" },
    { label: "Chats", route: "/chats", icon: "lucide:message-square" },
    { label: "Profile", route: "/profile", icon: "lucide:user" },
];

const route = useRoute();

const isActive = (path: string) => {
    return route.path === path;
};

const handleNavigate = (path: string) => {
    navigateTo(path);
};
</script>
