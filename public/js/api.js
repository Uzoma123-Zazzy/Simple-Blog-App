window.BlogApi = {
  request: async (url, options = {}) => {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      const error = new Error(data.message || "Request failed");
      error.status = response.status;
      throw error;
    }

    return data;
  },
};
