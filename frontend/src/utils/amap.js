import { ElMessage } from 'element-plus';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || '';

// 获取定位
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      ElMessage.warning('浏览器不支持定位功能，使用默认位置');
      resolve({ lat: 30.73023, lng: 103.94708 });
      return;
    }
    
    // 检查权限状态
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
            getCurrentPosition(resolve, reject);
          } else if (permissionStatus.state === 'prompt') {
            getCurrentPosition(resolve, reject);
          } else {
            ElMessage.warning('定位权限被拒绝，使用默认位置');
            resolve({ lat: 30.73023, lng: 103.94708 });
          }
        })
        .catch(() => {
          getCurrentPosition(resolve, reject);
        });
    } else {
      getCurrentPosition(resolve, reject);
    }
  });
}

// 获取当前位置的辅助函数
function getCurrentPosition(resolve, reject) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      console.error('定位失败:', error);
      ElMessage.warning('定位失败，使用默认位置');
      resolve({ lat: 30.73023, lng: 103.94708 });
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
}

// 搜索附近中医馆（高德HTTP接口，无地图，稳定可用）
export async function searchNearbyTCM(lng, lat, radius = 5000) {
  try {
    if (!AMAP_KEY) {
      ElMessage.warning('未配置高德地图API密钥');
      return [];
    }
    
    if (!lng || !lat) {
      ElMessage.warning('位置信息无效');
      return [];
    }
    
    const url = `https://restapi.amap.com/v3/place/around?key=${AMAP_KEY}&location=${lng},${lat}&radius=${radius}&keywords=中医馆&output=json`;

    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();

    if (data.status === '1' && data.pois && Array.isArray(data.pois)) {
      return data.pois.slice(0, 5).map(item => ({
        id: item.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || '未知中医馆',
        address: item.address || '暂无地址',
        distance: item.distance || '未知'
      }));
    } else {
      console.error('搜索中医馆失败:', data.info || '未知错误');
      ElMessage.warning('搜索中医馆失败，请稍后重试');
      return [];
    }
  } catch (err) {
    console.error('搜索中医馆出错:', err);
    ElMessage.error('搜索中医馆时发生错误');
    return [];
  }
}

// 获取城市名称
export async function getCityByLocation(lng, lat) {
  try {
    if (!AMAP_KEY) {
      return '成都市';
    }
    
    if (!lng || !lat) {
      return '成都市';
    }
    
    const res = await fetch(`https://restapi.amap.com/v3/geocode/regeo?location=${lng},${lat}&key=${AMAP_KEY}`);
    
    if (!res.ok) {
      return '成都市';
    }
    
    const data = await res.json();
    return data?.regeocode?.addressComponent?.city || data?.regeocode?.addressComponent?.province || '成都市';
  } catch (e) {
    console.error('获取城市名称失败:', e);
    return '成都市';
  }
}

export function isAMapConfigured() {
  return !!AMAP_KEY;
}

// 空函数，防止报错
export async function initAMap() {}