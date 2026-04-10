import httpx
import os
from langchain_core.tools import tool
GAODE_API_KEY=os.getenv("GAODE_API_KEY")
GAODE_API=os.getenv("GAODE_API")
JISU_API_KEY=os.getenv("JISU_API_KEY")
JISU_API=os.getenv("JISU_API")
async def get_coordinates(city: str):#地理位置
  """
通过高德地图 API 将城市名转换为经纬度
  """
  url=GAODE_API
  params={"address": city, "output": "JSON", "key": "GAODE_API_KEY"}
  async with httpx.AsyncClient() as client:
    response=await client.get(url,params=params)
    data=response.json
    if data["status"] == "1" and data["geocodes"]:
            location = data["geocodes"][0]["location"]  # 格式 "经度,纬度"
            lon, lat = location.split(",")
            return lat, lon
    return None, None
def map_weather_code(code: int) -> str:
    """
    将 Open-Meteo 的天气代码映射为中文描述
    参考：https://open-meteo.com/en/docs
    """
    weather_codes = {
        0: "晴",
        1: "晴",
        2: "少云",
        3: "多云",
        45: "雾",
        48: "雾",
        51: "毛毛雨",
        53: "毛毛雨",
        55: "毛毛雨",
        56: "冻雨",
        57: "冻雨",
        61: "小雨",
        63: "中雨",
        65: "大雨",
        66: "冻雨",
        67: "冻雨",
        71: "小雪",
        73: "中雪",
        75: "大雪",
        77: "雪粒",
        80: "阵雨",
        81: "阵雨",
        82: "阵雨",
        85: "阵雪",
        86: "阵雪",
        95: "雷雨",
        96: "雷雨",
        99: "雷雨",
    }
    return weather_codes.get(code, "未知")
async def get_weather(lat, lon):#实时天气
    """通过 Open-Meteo API 获取实时天气"""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current_weather": True,
        "timezone": "auto"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()
        current = data.get("current_weather", {})
        temp = current.get("temperature", "N/A")
        weathercode = current.get("weathercode", "N/A")
        # Open-Meteo 的 weathercode 需要映射成文字描述
        weather_desc = map_weather_code(weathercode)  # 这里需要实现映射函数
        return f"温度: {temp}°C, 天气: {weather_desc}"
async def get_solar_term():#实时节气
    """获取当前的节气信息"""
    url = JISU_API
    params = {"appkey": "JISU_API_KEY", "year": "2026"}  # 请替换为你的 API Key
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()
        # 这里需要根据 API 返回的数据结构解析出当前节气
        if data.get("status") == "0" and data.get("result"):
            # 假设返回结果中有当前节气字段
            return data["result"]["current"]["name"]
    return "未知"
@tool
async def get_weather_solar_term(city: str) -> str:
    """获取指定城市的天气和节气信息"""
    lat, lon = await get_coordinates(city)
    if lat and lon:
        weather_info = await get_weather(lat, lon)
        solar_term = await get_solar_term()
        return f"{city}当前天气: {weather_info}, 节气: {solar_term}"
    return f"无法获取{city}的地理位置信息。"