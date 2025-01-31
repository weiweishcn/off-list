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
      "images": getDesignImages(1, 20),
      "folder": "design1/",
      "description": "San Jose, CA",
      "id": 1
    },
    {
      "designer": "suresh",
      "images": getDesignImages(2, 20),
      "folder": "design2/",
      "description": "Queens, NY",
      "id": 2
    },
    {
      "designer": "ramesh",
      "images": getDesignImages(3, 14),
      "folder": "design3/",
      "description": "Los Angeles, CA",
      "id": 3
    },
        {
      "designer": "ramesh",
      "images": getDesignImages(4, 15),
      "folder": "design4/",
      "description": "Los Angeles, CA",
      "id": 4
    },
        {
      "designer": "ramesh",
      "images": getDesignImages(5, 15),
      "folder": "design5/",
      "description": "Seattle, WA",
      "id": 5
    },
    {
      "designer": "ramesh",
      "images": getDesignImages(6, 38),
      "folder": "design6/",
      "description": "Santa Clara, CA",
      "id": 6
    }
  ]
};