import { ElMessage } from 'element-plus';

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || '';

// 获取定位
export function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 30.73023, lng: 103.94708 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        resolve({ lat: 30.73023, lng: 103.94708 });
      }
    );
  });
}

// 搜索附近中医馆（高德HTTP接口，无地图，稳定可用）
export async function searchNearbyTCM(lng, lat, radius = 5000) {
  try {
    const url = `https://restapi.amap.com/v3/place/around?key=${AMAP_KEY}&location=${lng},${lat}&radius=${radius}&keywords=中医馆&output=json`

    const res = await fetch(url)
    const data = await res.json()

    if (data.status === '1' && data.pois) {
      return data.pois.slice(0, 5).map(item => ({
        id: item.id,
        name: item.name,
        address: item.address || '暂无地址',
        distance: item.distance || '未知'
      }))
    }
    return []
  } catch (err) {
    console.error('搜索失败', err)
    return []
  }
}

// 获取城市名称
export async function getCityByLocation(lng, lat) {
  try {
    const res = await fetch(`https://restapi.amap.com/v3/geocode/regeo?location=${lng},${lat}&key=${AMAP_KEY}`)
    const data = await res.json()
    return data?.regeocode?.addressComponent?.city || '成都市'
  } catch (e) {
    return '成都市'
  }
}

export function isAMapConfigured() {
  return !!AMAP_KEY
}

// 空函数，防止报错
export async function initAMap() {}