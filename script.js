const margin = { top: 20, right: 30, bottom: 40, left: 200},
      width = 800 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom; // Increased height

const svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("data.csv").then(data => {
  // Step 1: Define the allowed genres
  const allowedGenres = [
    "Comedy", 
    "Horror", 
    "Action", 
    "Romance", 
    "Drama", 
    "Science Fiction & Fantasy", 
    "Kids & Family", 
    "Animation", 
    "Documentary", 
    "Musical & Performing Arts",
    "Western"
  ];

  const filteredData = data
    .map(d => ({
      movie_title: d.movie_title,
      genre: d.genre,
      audience_rating: +d.audience_rating
    }))
    .filter(d => 
      d.movie_title && 
      !isNaN(d.audience_rating) && 
      allowedGenres.includes(d.genre)
    );

  const genres = d3.group(filteredData, d => d.genre);
  const avgRatings = Array.from(genres, ([key, values]) => ({
    genre: key,
    avgAudienceRating: d3.mean(values, d => d.audience_rating)
  })).filter(d => d.avgAudienceRating);

  
  avgRatings.sort((a, b) => b.avgAudienceRating - a.avgAudienceRating);

  const x = d3.scaleLinear()
    .domain([0, d3.max(avgRatings, d => d.avgAudienceRating)])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(avgRatings.map(d => d.genre))
    .range([0, height])
    .padding(0.2);

  svg.append("g")
    .selectAll("rect")
    .data(avgRatings)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(d.genre))
    .attr("width", d => x(d.avgAudienceRating))
    .attr("height", y.bandwidth() * 1.2)
    .attr("fill", "steelblue")
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible").text(`Avg Rating: ${d.avgAudienceRating.toFixed(1)}`);
    })
    .on("mousemove", event => {
      tooltip.style("top", `${event.pageY + 10}px`).style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "14px");

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("font-size", "14px");

  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#f8f9fa")
    .style("padding", "5px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px");

  svg.append("g")
    .selectAll("text")
    .data(avgRatings)
    .enter()
    .append("text")
    .attr("x", d => x(d.avgAudienceRating) + 5)
    .attr("y", d => y(d.genre) + y.bandwidth() / 2)
    .attr("dy", ".35em")
    .text(d => d.avgAudienceRating.toFixed(1))
    .style("font-size", "12px")
    .attr("fill", "black");

}).catch(error => {
  console.error("Error loading or processing data:", error);
});