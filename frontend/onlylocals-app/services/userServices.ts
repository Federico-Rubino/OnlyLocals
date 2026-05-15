import apiClient from './api';

export const userService = {
  
    addFavorites: async (shopId: string) => {
      console.log("add SHOPID:", shopId);
        const response = await apiClient.post(`/users/favorites`, {
          shopId,
        });

    return response.data.data; 
  },

    removeFavorites: async (shopId: string) => {
      console.log("removing SHOPID:", shopId);
        const response = await apiClient.delete(`/users/favorites`, {
          data: {
            shopId,
          },
        });

    return response.data.data; 
  }
};