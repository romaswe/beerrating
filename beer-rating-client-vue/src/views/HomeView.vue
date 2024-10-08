<script setup lang="ts"></script>

<template>
  <main class="container">
    <!-- New Section: Welcome Message -->
    <section class="section welcome-section card">
      <h2>Welcome to Beer Ratings</h2>
      <p>
        Discover and compare ratings of various beers, explore different styles, and find the best
        glassware for your favorite brews. Whether you're an aficionado or just getting started,
        this site is your guide to the world of beer.
      </p>
    </section>

    <!-- Section: Beer Styles -->
    <section class="section beer-styles card">
      <h2>Beer Styles</h2>
      <p>
        Beer styles range from light lagers to dark stouts, each with unique characteristics. Here
        are some common beer styles:
      </p>
      <ul>
        <li><strong>Lager:</strong> A light, crisp, and refreshing beer. Ideal for hot weather.</li>
        <li>
          <strong>Ale:</strong> Known for its fruity and spicy flavors. Ales are usually
          fuller-bodied than lagers.
        </li>
        <li>
          <strong>Stout:</strong> A dark, rich beer with flavors of coffee, chocolate, and roasted
          malt.
        </li>
        <li>
          <strong>IPA (India Pale Ale):</strong> A hoppy beer style known for its strong, bitter
          flavor and floral aroma.
        </li>
        <li>
          <strong>Wheat Beer:</strong> A light and cloudy beer with a smooth, slightly sweet taste.
        </li>
        <li>
          <strong>Sour Beer:</strong> A tart and tangy beer with a unique acidic flavor profile.
        </li>
      </ul>
    </section>

    <!-- Section: Taste Profiles -->
    <section class="section taste-profiles card">
      <h2>Taste Profiles of Beers</h2>
      <p>
        Understanding the taste profile of a beer can enhance your tasting experience. Here are some
        common taste descriptors:
      </p>
      <ul>
        <li><strong>Sweet:</strong> Rich malt flavors, often found in stouts and porters.</li>
        <li><strong>Bitter:</strong> Hoppy and resinous, typical of IPAs.</li>
        <li><strong>Sour:</strong> Tart and acidic, characteristic of sour beers.</li>
        <li>
          <strong>Fruity:</strong> Notes of citrus, berries, or tropical fruits, often found in
          wheat beers and IPAs.
        </li>
        <li>
          <strong>Spicy:</strong> Clove, pepper, and other spice notes, common in Belgian ales.
        </li>
      </ul>
    </section>

    <!-- Section: Beer Glassware -->
    <section class="section beer-glassware card">
      <h2>Beer Glassware</h2>
      <p>
        The right glass can enhance the aroma and flavor of your beer. Here are some common types of
        beer glassware:
      </p>
      <ul>
        <li><strong>Pint Glass:</strong> A versatile glass suitable for most beer styles.</li>
        <li>
          <strong>Snifter:</strong> Ideal for strong ales and stouts, allowing you to swirl the beer
          and release its aromas.
        </li>
        <li><strong>Weizen Glass:</strong> Tall and curved, perfect for wheat beers.</li>
        <li>
          <strong>Pilsner Glass:</strong> A tall, slender glass that showcases the color and
          carbonation of lagers and pilsners.
        </li>
        <li>
          <strong>Goblet:</strong> Wide-mouthed glass ideal for Belgian ales and other rich beers.
        </li>
      </ul>
    </section>

    <!-- Section: Tasting and Evaluating Beer -->
    <section class="section tasting card">
      <h2>Tasting and Evaluating Beer</h2>
      <p>
        Enhance your beer tasting experience with tips on how to properly taste and evaluate
        different types of beer.
      </p>
      <ol>
        <li><strong>Appearance:</strong> Observe the beer's color, clarity, and foam.</li>
        <li><strong>Aroma:</strong> Swirl the beer gently and take a deep sniff.</li>
        <li><strong>Taste:</strong> Take a small sip and consider the balance of flavors.</li>
        <li><strong>Mouthfeel:</strong> Pay attention to the texture and body of the beer.</li>
        <li><strong>Finish:</strong> Notice the aftertaste and how long the flavors linger.</li>
      </ol>
    </section>

    <!-- Section: Health and Beer -->
    <section class="section health card">
      <h2>Health and Beer</h2>
      <p>
        Explore the health benefits and risks associated with beer consumption. Learn how to enjoy
        beer responsibly as part of a balanced lifestyle.
      </p>
      <ul>
        <li><strong>Moderate Consumption:</strong> Benefits of drinking beer in moderation.</li>
        <li><strong>Antioxidants:</strong> The health benefits of antioxidants found in beer.</li>
        <li>
          <strong>Risks of Overconsumption:</strong> Health risks associated with excessive
          drinking.
        </li>
      </ul>
    </section>

    <!-- Section: Beer Myths and Facts -->
    <section class="section myths card">
      <h2>Beer Myths and Facts</h2>
      <p>Debunk common myths about beer and learn the real facts behind popular misconceptions.</p>
      <ul>
        <li>
          <strong>Myth:</strong> Dark beers are stronger than light beers.<br /><strong>Fact:</strong>
          Color does not indicate strength.
        </li>
        <li>
          <strong>Myth:</strong> Beer should always be served ice-cold.<br /><strong>Fact:</strong>
          Some beers are best served at warmer temperatures.
        </li>
        <li>
          <strong>Myth:</strong> Beer causes "beer belly."<br /><strong>Fact:</strong> Weight gain
          is due to excess calories, not beer itself.
        </li>
      </ul>
    </section>

    <!-- Section: Beer and the Environment -->
    <section class="section environment card">
      <h2>Beer and the Environment</h2>
      <p>
        Understand the environmental impact of beer production and learn how breweries are adopting
        sustainable practices.
      </p>
      <ul>
        <li><strong>Water Usage:</strong> Beer production is water-intensive.</li>
        <li><strong>Energy Consumption:</strong> Brewing requires significant energy.</li>
        <li>
          <strong>Recycling and Waste Management:</strong> Sustainable practices in breweries.
        </li>
      </ul>
    </section>

    <!-- New Section: About This Site -->
    <section class="section about-section card">
      <h2>About This Site</h2>
      <p>
        This website is designed to help beer enthusiasts explore and compare different beers based
        on ratings. Whether you're looking for the top-rated beers or learning more about various
        beer styles and glassware, this site is your ultimate beer companion.
      </p>
    </section>
  </main>
</template>
<style scoped>
/* General Styles */
body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #f0f0f0;
}

ul,
ol {
  list-style: none;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Card Styles */
.card {
  background-color: #ffffff;
  padding: 20px;
  margin: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  flex: 1 1 calc(50% - 40px);
  /* Make each card take half width with spacing */
  box-sizing: border-box;
}

/* Section Styles */
.section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

h2 {
  font-size: 1.5em;
  margin-bottom: 10px;
  color: #333;
  width: 100%;
  /* Ensure the h2 takes the full width of its container */
}

p,
ul,
ol {
  margin-bottom: 10px;
  color: #666;
  width: 100%;
  /* Ensure the paragraphs and lists take full width */
}

ul,
ol {
  padding-left: 20px;
}

li {
  margin-bottom: 5px;
}

strong {
  color: #333;
}

/* Responsive Design */
@media (max-width: 768px) {
  .card {
    flex: 1 1 100%;
    /* Full width on mobile */
    margin-bottom: 20px;
  }

  .section {
    flex-direction: column;
  }
}
</style>
