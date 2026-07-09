window.BlogUtils = {
  formatDate: (value) => {
    if (!value) return "No date";
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  },

  excerpt: (text, max = 115) => {
    if (!text) return "";
    return text.length > max ? `${text.slice(0, max).trim()}...` : text;
  },

  getSelectedImage: async (input) => {
    const file = input.files?.[0];

    if (!file) {
      return "";
    }

    if (file.size > 3 * 1024 * 1024) {
      throw new Error("Please select an image smaller than 3MB");
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.addEventListener("error", () => reject(new Error("Could not read selected image")));
      reader.readAsDataURL(file);
    });
  },

  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  shufflePosts: (posts) => {
    const shuffled = [...posts];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
  },

  getDetectedCountry: () => {
    const locale = navigator.language || "en-US";
    const region = locale.split("-")[1] || "US";

    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(region.toUpperCase()) || "United States";
    } catch (error) {
      return "United States";
    }
  },
};
