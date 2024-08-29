<template>
    <form @submit.prevent="handleSubmit" class="beer-form">
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" v-model="form.name" required />
        </div>
        <div class="form-group">
            <label for="type">Type</label>
            <input type="text" id="type" v-model="form.type" required />
        </div>
        <div class="form-group">
            <label for="brewery">Brewery</label>
            <input type="text" id="brewery" v-model="form.brewery" />
        </div>
        <div class="form-group">
            <label for="abv">ABV (%)</label>
            <input type="number" id="abv" v-model="form.abv" step="0.1" />
        </div>
        <div class="form-group">
            <label for="averageRating">Average Rating</label>
            <input type="number" id="averageRating" v-model="form.averageRating" step="0.1" />
        </div>
        <button type="submit" class="submit-button">{{ isEdit ? 'Update Beer' : 'Add Beer' }}</button>
        <button type="button" @click="cancel" class="cancel-button">Cancel</button>
    </form>
    <div v-if="error">
        <ErrorComponent :errorMessage="error" @retry="handleSubmit" />
    </div>

</template>

<script lang="ts">
import { defineComponent, ref, type PropType, watch, toRefs } from 'vue'
import type { Beer, BeerStyle } from '@/models/Beer'
import { Myconsts } from '@/const';
import ErrorComponent from '@/components/ErrorComponent.vue'

export default defineComponent({
    name: 'BeerForm',
    props: {
        beer: {
            type: Object as PropType<Beer>,
            required: false,
        },
        isEdit: {
            type: Boolean,
            default: false,
        }
    },
    components: {
        ErrorComponent
    },
    emits: ['submit', 'cancel'],
    setup(props, { emit }) {
        const error = ref<string | null>(null)
        const { beer, isEdit } = toRefs(props)
        const form = ref<Partial<Beer>>(isEdit.value && beer.value ? { ...beer.value } : {
            name: '',
            type: '' as BeerStyle,
            brewery: '',
            abv: undefined,
            averageRating: undefined,
        })

        const handleSubmit = async () => {
            error.value = null
            try {
                const token = localStorage.getItem(Myconsts.tokenName)
                if (!token) {
                    throw new Error('User is not authenticated')
                }

                let response
                if (isEdit.value && beer.value?._id) {
                    // Update beer
                    response = await fetch(`/api/beers/${beer.value._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(form.value),
                    })
                } else {
                    // Add new beer
                    response = await fetch(`/api/beers`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(form.value),
                    })
                }

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || 'Failed to submit form')
                }

                const data = await response.json()
                emit('submit', data)
            } catch (err) {
                console.error('Failed to submit form:', error)
                error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
            }
        }

        const cancel = () => {
            emit('cancel')
        }

        watch(isEdit, (newVal) => {
            if (newVal && beer.value) {
                form.value = { ...beer.value }
            } else {
                form.value = {
                    name: '',
                    type: '' as BeerStyle,
                    brewery: '',
                    abv: undefined,
                    averageRating: undefined,
                }
            }
        })

        return {
            form,
            handleSubmit,
            cancel,
            error
        }
    }
})
</script>

<style scoped>
.beer-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.submit-button,
.cancel-button {
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.submit-button:hover,
.cancel-button:hover {
    background-color: #2980b9;
}
</style>