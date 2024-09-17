# Beer Rating App

The **Beer Rating App** is a web application for beer enthusiasts to discover, review, and rate a wide variety of beers. The app allows users to search for beers, filter them by various criteria, and rate multiple beers in bulk. It provides features such as user profiles, beer ratings, and stats tracking. The app is built using Vue.js with TypeScript for a responsive and modern user interface.

## Features

### 1. **Beer Search and Filter**

-   Users can search for beers by name, filter by styles, breweries, and Alcohol by Volume (ABV) range.
-   Advanced filters allow sorting beers by fields such as name, average rating, ABV, beer style, or brewery.
-   Sorting options can be set to ascending or descending order for better navigation of search results.

### 2. **Pagination**

-   The app uses pagination for fetching large sets of beer data, ensuring efficient browsing through the beer list.
-   Pagination controls are provided for navigating through the beer pages.

### 3. **Bulk Rating System**

-   Users can rate multiple beers at once on the bulk rating page. The ratings include scores and optional comments for each beer.
-   A streamlined UI allows easy access to beer details such as brewery, type, and average rating for quick decision-making during bulk ratings.

### 4. **User Profile**

-   Each user has a profile view that includes:
    -   **UserStatsComponent**: Displays overall stats for the user, including top-rated beer styles.
    -   **UserRatedBeersComponent**: Shows beers that the user has already rated.
    -   **UserNotRatedBeersComponent**: Displays beers that the user has yet to rate.
-   The profile includes pagination controls for rated and unrated beers, helping users manage their beer ratings.

### 5. **Brewery Selection**

-   Users can efficiently select from a large number of breweries using a specialized brewery selection component. This feature ensures that the brewery filter is scalable for large datasets.

### 6. **Responsive Design**

-   The site is designed to be responsive and visually appealing across all device sizes, from mobile phones to desktops.
-   The navigation bar and filter sections are optimized for mobile scaling and usability.

### 7. **Beer Details Modal**

-   Clicking on a beer opens a detailed modal view that shows more in-depth information about the beer and allows the user to edit or rate the beer directly from the modal.

## Tech Stack

### **Frontend**

-   **Vue.js 3**: JavaScript framework used for building the user interface.
-   **TypeScript**: Strongly typed JavaScript, ensuring robust and predictable code.
-   **SCSS/CSS**: For styling and ensuring a responsive and sleek design.
-   **Vue Router**: For navigating between views such as beer listing, user profile, and bulk rating pages.

### **Backend**

-   While this README focuses on the frontend development, the app connects to a RESTful API backend that provides beer data, manages ratings, and handles user authentication.

### **API Endpoints**

-   **GET /api/beers**: Fetches a list of beers with various filter and sort options.
-   **POST /api/ratings/batch**: Submits multiple beer ratings in one request.
-   **GET /api/stats/user-stats**: Fetches the user's profile, including rated and unrated beers.

## Roadmap and Future Features

-   **Beer Recommendations**: Suggest beers based on the user's previous ratings and preferences.
-   **Social Sharing**: Allow users to share their beer ratings and reviews on social media platforms.

## Contributing

If you'd like to contribute to this project, please follow the standard fork, feature branch, and pull request workflow:

1. Fork the repository.
2. Create a new feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push the branch: `git push origin feature/new-feature`
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
