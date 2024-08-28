<template>
    <div class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <h2>{{ beer.name }}</h2>
            <div class="button-group">
                <a :href="`https://www.systembolaget.se/sortiment/?q=${encodeURIComponent(beer.name)}`"
                    class="button button-systembolaget" target="_blank" rel="noopener noreferrer">
                    Systembolaget
                </a>
                <a :href="`https://untappd.com/search?q=${encodeURIComponent(beer.name)}`" class="button button-untappd"
                    target="_blank" rel="noopener noreferrer">
                    Untappd
                </a>
                <a :href="`https://www.ratebeer.com/search?beername=${encodeURIComponent(beer.name)}&tab=beer`"
                    class="button button-ratebeer" target="_blank" rel="noopener noreferrer">
                    Ratebeer
                </a>
            </div>
            <p><strong>Type:</strong> {{ beer.type }}</p>
            <p v-if="beer.brewery"><strong>Brewery:</strong> {{ beer.brewery }}</p>
            <p v-if="beer.abv"><strong>ABV:</strong> {{ beer.abv }}%</p>
            <p v-if="beer.averageRating"><strong>Average Rating:</strong> {{ beer.averageRating }}</p>

            <h3>Ratings</h3>
            <ul v-if="ratings.length">
                <li v-for="rating in ratings" :key="rating._id">
                    <strong>{{ rating.user.username }}:</strong> {{ rating.score }} - {{ rating.comment }}
                </li>
            </ul>
            <p v-else>No ratings</p>

            <button @click="closeModal" class="close-button">Close</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Beer, Rating } from '@/models/Beer'

export default defineComponent({
    name: 'BeerModal',
    props: {
        beer: {
            type: Object as PropType<Beer>,
            required: true
        },
        ratings: {
            type: Array as PropType<Rating[]>,
            required: true
        }
    },
    emits: ['close-modal'],
    setup(_, { emit }) {
        const closeModal = () => {
            emit('close-modal')
        }

        return {
            closeModal
        }
    }
})
</script>

<style scoped>
.button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
}


.button {
    display: inline-block;
    padding: 8px 12px;
    text-decoration: none;
    color: white;
    border-radius: 4px;
    transition: background-color 0.3s ease;
    font-size: 0.9em;
}

.button-systembolaget {
    background-color: #004b9b;
}

.button-untappd {
    background-color: #f8a800;
}

.button-ratebeer {
    background-color: #4e4e4e;
}

.button:hover {
    opacity: 0.9;
}

.button {
    padding: 8px 12px;
    text-decoration: none;
    color: white;
    border-radius: 4px;
    transition: background-color 0.3s ease;
    font-size: 0.9em;
    display: inline-block;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    position: relative;
}

h2 {
    margin-top: 0;
}

.close-button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.close-button:hover {
    background-color: #2980b9;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    margin-bottom: 10px;
}
</style>