// Ширина бокового drawer. На узком экране DrawerShell раскрывается в
// полноэкранный sheet (см. max-[640px]:w-full). Оставлено 540px: плотный
// контент tx-drawer'а (grid-cols-3 с CopyableText) на 400px обрезается —
// spec-значение «Панель 400» требует сначала переверстать контент.
export const DRAWER_SIZE = "540px" as const;
