// DesignData.js
const getDesignImages = (designId, numberOfImages) => {
  const images = [];
  for (let i = 1; i <= numberOfImages; i++) {
    // Update path to match your structure and use .jpeg extension
    const imagePath = `/images/design${designId}/${i}.jpeg`;
    console.log('Creating image path:', imagePath);
    images.push(imagePath);
  }
  return images;
};

// Use module.exports instead of export
module.exports = {
  designs: [
    {
      "designer": "Sinan",
      "tag": "Modern",
      "style": "Modern",
      "images": getDesignImages(1, 20),
      "color": ["black", "white", "wood"],
      "description": "San Jose 95120",
      "id": 1
    },
    {
      "designer": "suresh",
      "tag": "old-fashioned",
      "style": "spanish",
      "images": getDesignImages(2, 20),
      "color": ["white", "grey"],
      "description": "San Mateo 94043",
      "id": 2
    },
    {
      "designer": "ramesh",
      "tag": "Wood",
      "style": "wabi sabi",
      "images": getDesignImages(3, 14),
      "color": ["light color", "wood"],
      "description": "Los Angeles 90005",
      "id": 3
    },
        {
      "designer": "ramesh",
      "tag": "Log Style",
      "style": "Wood",
      "images": getDesignImages(4, 15),
      "color": ["wood"],
      "description": "Los Angeles 90004",
      "id": 4
    },
        {
      "designer": "ramesh",
      "tag": "Modern Chinese",
      "style": "Wood",
      "images": getDesignImages(5, 15),
      "color": ["grey"],
      "description": "San Jose 95123",
      "id": 5
    },
    {
      "designer": "ramesh",
      "tag": "European",
      "style": "European",
      "images": getDesignImages(6, 38),
      "color": ["grey"],
      "description": "Santa Clara 95051",
      "id": 6
    }
  ]
};