<script setup>
import { toRefs } from 'vue'

const emit = defineEmits(['search', 'update:modelValue'])
const props = defineProps({
    modelValue: String,
    placeholder: String,
    disabled: Boolean,
})

const { modelValue, placeholder, disabled } = toRefs(props)
</script>

<template>
    <div class="gp-card">
        <div class="relative">
            <input
                type="text"
                class="gp-input pl-12 pr-28"
                :placeholder="placeholder"
                :value="modelValue"
                @input="emit('update:modelValue', $event.target.value)"
                @keydown.enter="emit('search')"
            >
            <div class="absolute left-0 inset-y-0 flex items-center justify-center pl-4 pr-2" :class="modelValue ? 'text-green-300' : 'text-slate-500'">
                <slot name="icon"></slot>
            </div>
            <div class="absolute right-0 inset-y-0 flex items-center pr-2">
                <button
                    class="gp-button-primary py-2"
                    :disabled="disabled"
                    @click="emit('search')"
                >
                    Search
                </button>
            </div>
        </div>
    </div>
</template>
