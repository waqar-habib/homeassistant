// Mock Home Assistant states for the render harness. No real data: names and numbers are made up
// to exercise the layouts ("Console Lamp", "Changing Table", both thermostats at 72, nothing playing).
export function makeHass(RealDate, fixed, scenario = "default") {
  const at = (h, m) => new RealDate(new RealDate(fixed).setHours(h, m, 0, 0)).toISOString();
  const lamp = (on, pct = 80, extra = {}) => ({ state: on ? "on" : "off", attributes: {
    supported_color_modes: ["color_temp", "rgb"], ...(on ? { brightness: Math.round(pct * 2.55), color_mode: "color_temp", color_temp_kelvin: 2700, rgb_color: [255, 167, 87] } : {}), ...extra } });
  const plug = (on) => ({ state: on ? "on" : "off", attributes: {} });
  const P = "sensor.living_room_adhan_";
  const states = {
    "weather.forecast_home": { state: "partlycloudy", attributes: { temperature: 71, apparent_temperature: 70, humidity: 48, temperature_unit: "°F" } },
    "sun.sun": { state: "above_horizon", attributes: {} },
    "person.waqar_habib": { state: "home", attributes: { friendly_name: "Waqar" } },
    "person.maham_habib": { state: "not_home", attributes: { friendly_name: "Maham" } },
    [P + "fajr_prayer"]: { state: at(5, 50), attributes: {} }, [P + "sunrise_time"]: { state: at(7, 0), attributes: {} },
    [P + "dhuhr_prayer"]: { state: at(12, 17), attributes: {} }, [P + "asr_prayer"]: { state: at(15, 5), attributes: {} },
    [P + "maghrib_prayer"]: { state: at(17, 33), attributes: {} }, [P + "isha_prayer"]: { state: at(18, 44), attributes: {} },
    "input_boolean.adhan_enabled": { state: "on", attributes: {} },
    "lock.living_room_front_door": { state: "locked", attributes: { friendly_name: "Front door" } },
    "cover.general_garage_door_garage_door": { state: "closed", attributes: { friendly_name: "Garage" } },
    "climate.downstairs": { state: "heat_cool", attributes: { friendly_name: "Downstairs", current_temperature: 72, target_temp_low: 68, target_temp_high: 76, min_temp: 50, max_temp: 90, hvac_action: "idle" } },
    "climate.upstairs": { state: "heat_cool", attributes: { friendly_name: "Upstairs", current_temperature: 72, target_temp_low: 68, target_temp_high: 76, min_temp: 50, max_temp: 90, hvac_action: "idle" } },
    "media_player.living_room_living_room_homepod": { state: "idle", attributes: { friendly_name: "Living Room", volume_level: 0.35 } },
    "media_player.master_bedroom_homepod": { state: "idle", attributes: { friendly_name: "Bedroom", volume_level: 0.3 } },
    "todo.shopping_list": { state: "3", attributes: { friendly_name: "Shopping list" } },
    "light.buffet": lamp(true, 100), "light.floor_lamp": lamp(true, 60), "light.side_table": lamp(false), "light.console_lamp": lamp(false),
    "light.dresser": lamp(false), "light.mahams_lamp": lamp(false), "light.waqars_lamp": lamp(false),
    "light.bookshelf": lamp(false), "light.changing_table": lamp(false), "light.nursery_floor_lamp": lamp(false),
    "light.game_room": lamp(false), "light.upstairs_guest": lamp(false), "light.study_lamp": lamp(false),
    "switch.upstairs_guest_guest_nightstand": plug(false), "switch.study_study_floor_lamp": plug(false),
    "light.smart_wi_fi_light_switch": { state: "off", attributes: { supported_color_modes: ["onoff"] } },
    "scene.movie": { state: "2026-11-16T20:00:00+00:00", attributes: {} }, "script.good_night": { state: "off", attributes: {} },
    "input_boolean.adhan_demo": { state: "on", attributes: {} },
  };
  if (scenario === "after-isha") { /* same sensors; the page time is set after Isha */ }
  if (scenario === "prayer-missing") states[P + "asr_prayer"].state = "unavailable";
  if (scenario === "playing") {
    Object.assign(states["media_player.living_room_living_room_homepod"], { state: "playing" });
    Object.assign(states["media_player.living_room_living_room_homepod"].attributes, { media_title: "Surah Ar-Rahman", media_artist: "Mishary Rashid Alafasy" });
  }
  if (scenario === "alert") { states["lock.living_room_front_door"].state = "unlocked"; states["light.side_table"].state = "unavailable"; }
  const calls = [];
  return {
    states, __calls: calls, themes: {},
    callService: async (domain, service, data, target) => { calls.push({ domain, service, data, target }); },
    hassUrl: (p) => p,
    connection: {
      subscribeMessage: async (cb, msg) => {
        if (msg.type === "weather/subscribe_forecast") setTimeout(() => cb({ forecast: [{ temperature: 78, templow: 55 }] }), 0);
        if (msg.type === "todo/item/subscribe") setTimeout(() => cb({ items: [
          { uid: "1", summary: "Milk", status: "needs_action" }, { uid: "2", summary: "Dates", status: "needs_action" }, { uid: "3", summary: "Olive oil", status: "needs_action" }] }), 0);
        return () => {};
      },
    },
  };
}
