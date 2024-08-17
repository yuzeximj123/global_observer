// 1. 时间显示
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function checkTime() {
    var date = new Date();
    var sufix = '';
    var hours = ('0' + date.getHours()).slice(-2);
    var minutes = ('0' + date.getMinutes()).slice(-2);
    var day = date.getDate();
    var month = monthNames[date.getMonth()];
    var weekday = dayNames[date.getDay()];
    var year = date.getFullYear();
    if (day > 3 && day < 21) sufix = 'th';
    switch (day % 10) {
        case 1:
            sufix = "st";
        case 2:
            sufix = "nd";
        case 3:
            sufix = "rd";
        default:
            sufix = "th";
    }
    document.getElementById('time').innerHTML = weekday + ' ' + day + sufix + ', ' + month + ' ' + year;
}
setInterval(checkTime, 1000); // 修正：去掉了checkTime()的调用符号，以确保setInterval能够持续调用该函数

// 2. 黑夜模式切换
const toggleSwitch = document.querySelector('.dark_mode_switch input[type="checkbox"]');
const currentTheme = localStorage.getItem('theme');

// 页面加载时应用存储的主题
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

toggleSwitch.addEventListener('change', switchTheme, false);

// 3. 语言切换功能
let currentLanguage = 'en';

function switchLanguage(language) {
    currentLanguage = language;
    loadArticles(); // 每次切换语言时重新加载文章内容
}

function loadArticles() {
  fetch('data/articles.json')
      .then(response => response.json())
      .then(data => {
          const articlesSection = document.getElementById('articles-section');
          articlesSection.innerHTML = ''; // 清空现有内容
          const articles = data[currentLanguage].articles;
          articles.forEach(article => {
              const articleElement = document.createElement('article');
              articleElement.classList.add('the-grid');

              const articleLink = `./articles/article-template.html?image=${encodeURIComponent(article.image)}&title=${encodeURIComponent(article.title)}&content=${encodeURIComponent(article.content)}`;

              articleElement.innerHTML = `
                  <div class="the-grid-content">
                      <div class="headline">
                          <a href="${articleLink}">
                              <h2 class="title">${article.title}</h2>
                              <figure>
                                  <img alt="${article.title}" src="${article.image}"/>
                              </figure>
                          </a>
                      </div>
                      <p>${article.content}</p>
                      <div class="button">
                          <a href="${articleLink}">${article.linkText}</a>
                      </div>
                  </div>
              `;

              articlesSection.appendChild(articleElement);
          });
      });
}


// 页面加载时初始化文章内容
document.addEventListener('DOMContentLoaded', () => {
    loadArticles(); // 默认加载英文内容
});

// 4. 地球项目绘制
var canvas = d3.select("canvas");
var ctx = canvas.node().getContext("2d");
var canvasWidth = +canvas.attr("width");
var canvasHeight = +canvas.attr("height");

var projection = d3
  .geoOrthographic()
  .rotate([-161.03795250984288, -78.66662854125848, 180])
  .fitSize([canvasWidth, canvasHeight], { type: "Sphere" });

var geoPathGenerator = d3
  .geoPath()
  .projection(projection)
  .context(ctx);

ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.fillStyle = "white";

var sphereStyle = {
  lineWidth: 1,
  strokeStyle: "grey"
};

var countriesStyle = {
  lineWidth: 0.5,
  strokeStyle: "#1d2224"
};

var allFlightLinesStyle = {
  lineWidth: 2,
  strokeStyle: "rgba(0, 191, 255, 0.75)"
};

var activeFlightLineStyle = {
  lineWidth: 5,
  strokeStyle: "#0D0970"
};

drawEarth(true, false);

d3
  .json("https://unpkg.com/world-atlas@1.1.4/world/110m.json")
  .then(function(loadedTopoJson) {
    var topology = topojson.presimplify(loadedTopoJson);
    topology = topojson.simplify(topology, 0.25);
    var worldGeoJson = topojson.feature(topology, topology.objects.countries);

    drawEarth(false, worldGeoJson);

    Promise.all([
      d3.csv(
        "https://gist.githubusercontent.com/jwasilgeo/df731e6bec2ce12ceb2b0bc2274c5ee9/raw/5b22f98b114d1624893a0f370bb63ad81fc13b5c/longest_flights_10242018.csv"
      ),
      d3.json(
        "https://gist.githubusercontent.com/jwasilgeo/df731e6bec2ce12ceb2b0bc2274c5ee9/raw/5b22f98b114d1624893a0f370bb63ad81fc13b5c/airports.topojson.json"
      )
    ]).then(function(loadedDataResults) {
      var csvData = loadedDataResults[0];

      var airportsGeoJson = topojson.feature(
        loadedDataResults[1],
        loadedDataResults[1].objects.collection
      );

      var lineStringGeometryInfos = csvData.map(function(csvRow) {
        var fromCoordinates = airportsGeoJson.features.filter(function(f) {
          return f.properties.name === csvRow.From;
        })[0].geometry.coordinates;

        var toCoordinates = airportsGeoJson.features.filter(function(f) {
          return f.properties.name === csvRow.To;
        })[0].geometry.coordinates;

        var lineStringGeometry = {
          type: "LineString",
          coordinates: [fromCoordinates, toCoordinates]
        };

        var fromLatLon = new LatLon(fromCoordinates[1], fromCoordinates[0]);
        var toLatLon = new LatLon(toCoordinates[1], toCoordinates[0]);
        var midLatLon = fromLatLon.midpointTo(toLatLon);

        return {
          lineStringGeometry: lineStringGeometry,
          centroid: d3.geoCentroid(lineStringGeometry),
          bearing: midLatLon.bearingTo(toLatLon),
          fromCoordinates: fromCoordinates,
          toCoordinates: toCoordinates,
          fromAirportName: csvRow.From,
          toAirportName: csvRow.To,
          rank: csvRow.Rank,
          distance: csvRow.Distance
        };
      });

      drawInitialFlightLines(worldGeoJson, lineStringGeometryInfos);
    });
  });

function drawInitialFlightLines(worldGeoJson, lineStringGeometryInfos) {
  d3
    .select({})
    .transition()
    .duration(5000)
    .tween(null, function() {
      return function(t) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        drawEarth(true, worldGeoJson);

        ctx.lineWidth = allFlightLinesStyle.lineWidth;
        ctx.strokeStyle = allFlightLinesStyle.strokeStyle;
        lineStringGeometryInfos.forEach(function(geometryInfo) {
          var partialLine = JSON.parse(
            JSON.stringify(geometryInfo.lineStringGeometry)
          );
          var interpolatedEndPoint = d3.geoInterpolate(
            partialLine.coordinates[0],
            partialLine.coordinates[1]
          )(t);
          partialLine.coordinates[1] = interpolatedEndPoint;
          ctx.beginPath();
          geoPathGenerator(partialLine);
          ctx.stroke();
          ctx.closePath();
        });
      };
    })
    .on("end", function() {
      rotateMapToNextFeature(worldGeoJson, lineStringGeometryInfos);
    });
}

function rotateMapToNextFeature(worldGeoJson, lineStringGeometryInfos, delay) {
  var geometryInfo = lineStringGeometryInfos[0];
  var nextGeoJson = geometryInfo.lineStringGeometry;
  var nextCentroid = geometryInfo.centroid;
  var nextBearing = geometryInfo.bearing - 90;

  var nextRotationDestination = [
    -nextCentroid[0],
    -nextCentroid[1],
    nextBearing
  ];

  if (projection.rotate()[0] - nextRotationDestination[0] > 179) {
    nextRotationDestination[0] += 360;
  } else if (projection.rotate()[0] - nextRotationDestination[0] < -179) {
    nextRotationDestination[0] -= 360;
  }

  d3
    .select({})
    .transition()
    .duration(2000)
    .delay(delay ? delay : 0)
    .tween(null, function() {
      var interpolator = d3.interpolate(
        geoPathGenerator.projection().rotate(),
        nextRotationDestination
      );

      return function(t) {
        geoPathGenerator.projection().rotate(interpolator(t));

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        drawEarth(true, worldGeoJson);

        ctx.lineWidth = allFlightLinesStyle.lineWidth;
        ctx.strokeStyle = allFlightLinesStyle.strokeStyle;
        lineStringGeometryInfos.forEach(function(geometryInfo) {
          ctx.beginPath();
          geoPathGenerator(geometryInfo.lineStringGeometry);
          ctx.stroke();
          ctx.closePath();
        });
      };
    })
    .on("end", function() {
      animateActiveFlightLine(
        worldGeoJson,
        lineStringGeometryInfos,
        function() {
          lineStringGeometryInfos.push(lineStringGeometryInfos.shift());
          rotateMapToNextFeature(worldGeoJson, lineStringGeometryInfos, 1750);
        }
      );
    });
}

function animateActiveFlightLine(
  worldGeoJson,
  lineStringGeometryInfos,
  callback
) {
  var geometryInfo = lineStringGeometryInfos[0];
  var nextGeoJson = geometryInfo.lineStringGeometry;

  d3
    .select({})
    .transition()
    .duration(6000)
    .tween(null, function() {
      return function(t) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        drawEarth(true, worldGeoJson);

        ctx.lineWidth = allFlightLinesStyle.lineWidth;
        ctx.strokeStyle = allFlightLinesStyle.strokeStyle;
        lineStringGeometryInfos.forEach(function(geometryInfo) {
          ctx.beginPath();
          geoPathGenerator(geometryInfo.lineStringGeometry);
          ctx.stroke();
          ctx.closePath();
        });

        ctx.lineWidth = activeFlightLineStyle.lineWidth;
        ctx.strokeStyle = activeFlightLineStyle.strokeStyle;
        var partialLine = JSON.parse(JSON.stringify(nextGeoJson));
        var interpolatedEndPoint = d3.geoInterpolate(
          partialLine.coordinates[0],
          partialLine.coordinates[1]
        )(t);
        partialLine.coordinates[1] = interpolatedEndPoint;
        ctx.beginPath();
        geoPathGenerator(partialLine);
        ctx.stroke();
        ctx.closePath();
      };
    })
    .on("end", callback);
}

function drawEarth(drawSphere, worldGeoJson) {
  if (drawSphere) {
    ctx.lineWidth = sphereStyle.lineWidth;
    ctx.strokeStyle = sphereStyle.strokeStyle;
    ctx.beginPath();
    geoPathGenerator({ type: "Sphere" });
    ctx.stroke();
    ctx.closePath();
  }

  if (worldGeoJson) {
    ctx.lineWidth = countriesStyle.lineWidth;
    ctx.strokeStyle = countriesStyle.strokeStyle;
    ctx.beginPath();
    geoPathGenerator(worldGeoJson);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}
