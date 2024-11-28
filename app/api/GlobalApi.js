const { default: axios } = require("axios");

// Set a global timeout of 35 seconds (35000 milliseconds)
// axios.defaults.timeout = 35000; // 35 seconds
const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

const CreateNewUser = (data) => axios.post("/api/user", data);
const LoginUser = (data) => axios.post("/api/login", data);
const GetUser = (token) =>
  axios.get("/api/getUser", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

const CreateNewsArticle = (formData) => {

  return axios.post(`/api/createNewsArticle`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // 'Content-Type': 'multipart/form-data',
    },
  });
};

const GetNewsCategories = (token) => {
  return axios.get(`/api/getNewsCategories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
};

const CreateNewsCategory = (data) => {

  return axios.post(`/api/createNewsCategory`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const DeleteNewsCategory = (data) => {
  return axios.delete(`/api/deleteNewsCategory`, {
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetLearnSubjects = (token) => {
  return axios.get(`/api/getLearnSubjects`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
};

const CreateLearnQuiz = (formData) => {

  return axios.post(`/api/createLearnQuiz`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const CreateLearnTopic = (formData) => {

  return axios.post(`/api/CreateLearnTopic`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const FetchChallenges = async (data) => {

  return axios.post(`/api/fetchChallenges`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// New function to fetch news
const FetchNews = async (data) => {
  return axios.post(`/api/fetchNews`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};


const FetchNewsReports = (newsId) => {
  return axios.get(`/api/fetchNewsReports/${newsId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const FetchActivities = (age, type) => {
  return axios.get(`/api/fetchActivities`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      age,
      type,
    },
  });
};

const FetchAllUsers= () => {
  return axios.get(`/api/fetchUsers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const FetchUserChildren = (userId) => {
  return axios.get(`/api/fetchUserChildren/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export default {
  CreateNewUser,
  LoginUser,
  GetUser,

  /* News */
  CreateNewsArticle,
  GetNewsCategories,
  CreateNewsCategory,
  DeleteNewsCategory,
  FetchNews,
  FetchNewsReports,

  /* Learn */
  GetLearnSubjects,
  CreateLearnQuiz,
  CreateLearnTopic,
  FetchChallenges,

  /* Activities */
  FetchActivities,

  /* Users */
  FetchAllUsers,
  FetchUserChildren

};
