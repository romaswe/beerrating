# Beer Rating Service

The Beer Rating Service is a RESTful API for managing beer tastings and ratings. It provides endpoints for creating, reading, updating, and deleting beer tastings, as well as adding and retrieving ratings for each tasting.

## Features

- Create, read, update, and delete beer tastings
- Add and retrieve ratings for each tasting
- Support for pagination and filtering of tastings and ratings
- Integration with MongoDB for data storage

## Endpoints

### Tastings

- `GET /tastings`: Retrieve a list of all beer tastings
- `POST /tastings`: Create a new beer tasting
- `GET /tastings/:id`: Retrieve a single beer tasting by ID
- `PUT /tastings/:id`: Update a single beer tasting by ID
- `DELETE /tastings/:id`: Delete a single beer tasting by ID

### Ratings

- `GET /tastings/:id/ratings`: Retrieve a list of all ratings for a single beer tasting
- `POST /tastings/:id/ratings`: Add a new rating for a single beer tasting
- `GET /tastings/:id/ratings/:ratingId`: Retrieve a single rating for a single beer tasting by ID
- `PUT /tastings/:id/ratings/:ratingId`: Update a single rating for a single beer tasting by ID
- `DELETE /tastings/:id/ratings/:ratingId`: Delete a single rating for a single beer tasting by ID

## Models

### Tasting

- `name`: The name of the beer tasting
- `description`: A description of the beer tasting
- `beers`: An array of beer IDs associated with the tasting
- `users`: An array of user IDs who have tried the tasting
- `reviews`: An array of ratings for the tasting

### Rating

- `score`: The score given for the tasting (out of 5)
- `comment`: An optional comment for the rating

## Installation

1. Clone the repository: `git clone https://github.com/your-username/beer-rating-service.git`
2. Install dependencies: `npm install`
3. Start the server: `npm start`

## Contributing

Contributions are welcome! Please submit a pull request with your changes and a brief description of what you've added.
