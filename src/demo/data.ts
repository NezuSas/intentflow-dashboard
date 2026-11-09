import type { Board } from "@/features/boards";
import type { Client } from "@/features/clients";
import type { ADBCommand } from "@/features/commands";
import type { Intent, IntentSource } from "@/features/intents";
import type { ClientSubscription, SubscriptionPlan } from "@/features/subscriptions";
import type { User } from "@/features/users";
import type { ADBVersion } from "@/features/versions";

/**
 * Sample data for the demo: a small integrator with three clients and six Android displays.
 * Names, addresses and identifiers are invented. Dates are relative to "now" so the dashboard
 * always looks current.
 */

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();
const daysAgo = (days: number, hour = 9, minute = 0): string => {
  const date = new Date(now - days * DAY);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const versions: ADBVersion[] = [
  { id: 1, code: "A11", description: "Android 11 · pantallas Droidlogic", is_active: true, created_at: daysAgo(400) },
  { id: 2, code: "A12", description: "Android 12 · tablets Lenovo", is_active: true, created_at: daysAgo(300) },
  { id: 3, code: "A9", description: "Android 9 · equipos antiguos (solo lectura)", is_active: false, created_at: daysAgo(700) },
];

export const plans: SubscriptionPlan[] = [
  { id: 1, name: "Básico", plan_type: "basic", description: "Hasta 2 pantallas, comandos esenciales.", price: "19.00", max_boards: 2, is_active: true, created_at: daysAgo(500) },
  { id: 2, name: "Negocio", plan_type: "business", description: "Hasta 10 pantallas, comandos de contenido y programación.", price: "59.00", max_boards: 10, is_active: true, created_at: daysAgo(500) },
  { id: 3, name: "Corporativo", plan_type: "enterprise", description: "Pantallas ilimitadas, soporte prioritario.", price: "149.00", max_boards: 999, is_active: true, created_at: daysAgo(500) },
  { id: 4, name: "Piloto 2025", plan_type: "trial", description: "Plan de prueba retirado.", price: "0.00", max_boards: 1, is_active: false, created_at: daysAgo(640) },
];

export const clients: Client[] = [
  { id: 1, name: "Café Tomebamba", type: "retail", subscription_level: "business", identification_number: "0190000001001", email: "gerencia@cafetomebamba.ec", contact_name: "Lucía Andrade", phone: "+593 99 000 0001", address: "Calle Larga 7-20, Cuenca", owner: 1, is_active: true, created_at: daysAgo(210), updated_at: daysAgo(12) },
  { id: 2, name: "Clínica Monte Sinaí", type: "health", subscription_level: "enterprise", identification_number: "0190000002001", email: "sistemas@montesinai.ec", contact_name: "Dr. Esteban Ríos", phone: "+593 99 000 0002", address: "Av. Solano 2-15, Cuenca", owner: 1, is_active: true, created_at: daysAgo(160), updated_at: daysAgo(3) },
  { id: 3, name: "Hostal Yanuncay", type: "hospitality", subscription_level: "basic", identification_number: "0190000003001", email: "recepcion@hostalyanuncay.ec", contact_name: "Marco Peralta", phone: "+593 99 000 0003", address: "Av. Loja 1-80, Cuenca", owner: 1, is_active: false, created_at: daysAgo(380), updated_at: daysAgo(45) },
];

export const boards: Board[] = [
  { id: 1, name: "Menú entrada", description: "Pantalla vertical junto a la puerta", ip_address: "192.168.10.21", port: 5555, adb_identifier: "192.168.10.21:5555", status: "active", computed_status: "online", type: "signage", version: 1, version_detail: { id: 1, code: "A11" }, client: 1, client_detail: { id: 1, name: "Café Tomebamba" }, is_active: true, created_at: daysAgo(200), updated_at: daysAgo(1) },
  { id: 2, name: "Menú barra", description: "Pantalla horizontal sobre la barra", ip_address: "192.168.10.22", port: 5555, adb_identifier: "192.168.10.22:5555", status: "active", computed_status: "online", type: "signage", version: 1, version_detail: { id: 1, code: "A11" }, client: 1, client_detail: { id: 1, name: "Café Tomebamba" }, is_active: true, created_at: daysAgo(200), updated_at: daysAgo(1) },
  { id: 3, name: "Sala de espera", description: "Turnos y avisos", ip_address: "10.20.0.31", port: 5555, adb_identifier: "10.20.0.31:5555", status: "active", computed_status: "online", type: "signage", version: 2, version_detail: { id: 2, code: "A12" }, client: 2, client_detail: { id: 2, name: "Clínica Monte Sinaí" }, is_active: true, created_at: daysAgo(150), updated_at: daysAgo(0) },
  { id: 4, name: "Laboratorio", description: "Resultados y mensajes al personal", ip_address: "10.20.0.32", port: 5555, adb_identifier: "10.20.0.32:5555", status: "active", computed_status: "offline", type: "signage", version: 2, version_detail: { id: 2, code: "A12" }, client: 2, client_detail: { id: 2, name: "Clínica Monte Sinaí" }, is_active: true, created_at: daysAgo(150), updated_at: daysAgo(2) },
  { id: 5, name: "Recepción piso 3", description: "Tablet en mostrador", ip_address: "10.20.0.33", port: 5555, adb_identifier: "10.20.0.33:5555", status: "active", computed_status: "online", type: "tablet", version: 2, version_detail: { id: 2, code: "A12" }, client: 2, client_detail: { id: 2, name: "Clínica Monte Sinaí" }, is_active: true, created_at: daysAgo(90), updated_at: daysAgo(0) },
  { id: 6, name: "Lobby", description: "Pantalla retirada en la remodelación", ip_address: "192.168.50.10", port: 5555, adb_identifier: "192.168.50.10:5555", status: "inactive", computed_status: "offline", type: "signage", version: 3, version_detail: { id: 3, code: "A9" }, client: 3, client_detail: { id: 3, name: "Hostal Yanuncay" }, is_active: false, created_at: daysAgo(370), updated_at: daysAgo(45) },
];

export const commands: ADBCommand[] = [
  { id: 1, key: "screen_on", display_name: "Encender pantalla", description: "Despierta el dispositivo.", command: "input keyevent KEYCODE_WAKEUP", versions: [1, 2, 3], subscription_plans: [1, 2, 3], subscription_plans_detail: [{ id: 1, name: "Básico" }, { id: 2, name: "Negocio" }, { id: 3, name: "Corporativo" }], is_active: true, created_at: daysAgo(500) },
  { id: 2, key: "screen_off", display_name: "Apagar pantalla", description: "Pone el dispositivo a dormir.", command: "input keyevent KEYCODE_SLEEP", versions: [1, 2, 3], subscription_plans: [1, 2, 3], subscription_plans_detail: [{ id: 1, name: "Básico" }, { id: 2, name: "Negocio" }, { id: 3, name: "Corporativo" }], is_active: true, created_at: daysAgo(500) },
  { id: 3, key: "open_url", display_name: "Abrir URL", description: "Abre una dirección en el navegador de la pantalla.", command: "am start -a android.intent.action.VIEW -d {url}", versions: [1, 2], subscription_plans: [2, 3], subscription_plans_detail: [{ id: 2, name: "Negocio" }, { id: 3, name: "Corporativo" }], is_active: true, created_at: daysAgo(480) },
  { id: 4, key: "go_home", display_name: "Ir al inicio", description: "Vuelve a la pantalla principal.", command: "input keyevent KEYCODE_HOME", versions: [1, 2, 3], subscription_plans: [1, 2, 3], subscription_plans_detail: [{ id: 1, name: "Básico" }, { id: 2, name: "Negocio" }, { id: 3, name: "Corporativo" }], is_active: true, created_at: daysAgo(500) },
  { id: 5, key: "volume_set", display_name: "Fijar volumen", description: "Volumen multimedia de 0 a 15.", command: "cmd media_session volume --stream 3 --set {level}", versions: [1, 2], subscription_plans: [2, 3], subscription_plans_detail: [{ id: 2, name: "Negocio" }, { id: 3, name: "Corporativo" }], is_active: true, created_at: daysAgo(420) },
  { id: 6, key: "reboot", display_name: "Reiniciar", description: "Reinicia el dispositivo; requiere confirmación en el panel.", command: "reboot", versions: [1, 2, 3], subscription_plans: [3], subscription_plans_detail: [{ id: 3, name: "Corporativo" }], is_active: true, created_at: daysAgo(400) },
  { id: 7, key: "launch_player", display_name: "Abrir reproductor", description: "Lanza la app de cartelería.", command: "monkey -p com.nezu.player -c android.intent.category.LAUNCHER 1", versions: [1, 2], subscription_plans: [2, 3], subscription_plans_detail: [{ id: 2, name: "Negocio" }, { id: 3, name: "Corporativo" }], is_active: true, created_at: daysAgo(300) },
  { id: 8, key: "brightness_night", display_name: "Brillo nocturno", description: "Baja el brillo al 30 %.", command: "settings put system screen_brightness 77", versions: [2], subscription_plans: [2, 3], subscription_plans_detail: [{ id: 2, name: "Negocio" }, { id: 3, name: "Corporativo" }], is_active: false, created_at: daysAgo(120) },
];

export const users: User[] = [
  { id: 1, email: "demo@nezuecuador.com", first_name: "Operadora", last_name: "Demo", role: "admin", is_active: true, date_joined: daysAgo(520) },
  { id: 2, email: "lucia.andrade@cafetomebamba.ec", first_name: "Lucía", last_name: "Andrade", role: "client", is_active: true, date_joined: daysAgo(210) },
  { id: 3, email: "sistemas@montesinai.ec", first_name: "Esteban", last_name: "Ríos", role: "client", is_active: true, date_joined: daysAgo(160) },
  { id: 4, email: "soporte@nezuecuador.com", first_name: "Equipo", last_name: "Soporte", role: "operator", is_active: true, date_joined: daysAgo(480) },
  { id: 5, email: "marco.peralta@hostalyanuncay.ec", first_name: "Marco", last_name: "Peralta", role: "client", is_active: false, date_joined: daysAgo(380) },
];

export const subscriptions: ClientSubscription[] = [
  { id: 1, client_detail: { id: 1, name: "Café Tomebamba" }, subscription_plan_detail: { id: 2, name: "Negocio" }, start_date: daysAgo(200).slice(0, 10), end_date: null, is_active: true, payment_status: "paid" },
  { id: 2, client_detail: { id: 2, name: "Clínica Monte Sinaí" }, subscription_plan_detail: { id: 3, name: "Corporativo" }, start_date: daysAgo(150).slice(0, 10), end_date: null, is_active: true, payment_status: "paid" },
  { id: 3, client_detail: { id: 3, name: "Hostal Yanuncay" }, subscription_plan_detail: { id: 1, name: "Básico" }, start_date: daysAgo(370).slice(0, 10), end_date: daysAgo(45).slice(0, 10), is_active: false, payment_status: "cancelled" },
  { id: 4, client_detail: { id: 1, name: "Café Tomebamba" }, subscription_plan_detail: { id: 4, name: "Piloto 2025" }, start_date: daysAgo(260).slice(0, 10), end_date: daysAgo(200).slice(0, 10), is_active: false, payment_status: "expired" },
];

/** A month of activity: openings and closings every day, a few failures, one display that went offline. */
const buildIntents = (): Intent[] => {
  const sources: IntentSource[] = ["home_assistant", "api", "google_home", "home_assistant", "api"];
  const operators = [users[0], users[3], null];
  const activeBoards = boards.filter((board) => board.is_active);
  const asIntentBoard = (board: Board) => ({
    id: board.id, name: board.name, adb_identifier: board.adb_identifier, client: board.client,
    client_detail: board.client_detail, computed_status: board.computed_status,
  });
  const items: Intent[] = [];
  let id = 1;
  for (let day = 29; day >= 0; day--) {
    activeBoards.forEach((board, index) => {
      const labOffline = board.id === 4 && day <= 2;
      const open: Intent = {
        id: id++, board: asIntentBoard(board), user: operators[(day + index) % operators.length] ? { id: operators[(day + index) % operators.length]!.id, email: operators[(day + index) % operators.length]!.email } : null,
        command_key: "screen_on", resolved_command: "input keyevent KEYCODE_WAKEUP", version_used: board.version_detail?.code ?? "A11",
        status: labOffline ? "failed" : "success", source: sources[(day + index) % sources.length],
        output: labOffline ? null : "", error_code: labOffline ? "DEVICE_OFFLINE" : null,
        executed_at: daysAgo(day, 7, 30 + index * 2),
      };
      items.push(open);
      if (board.type !== "tablet") {
        items.push({
          id: id++, board: asIntentBoard(board), user: null,
          command_key: "launch_player", resolved_command: "monkey -p com.nezu.player -c android.intent.category.LAUNCHER 1", version_used: board.version_detail?.code ?? "A11",
          status: labOffline ? "failed" : "success", source: "api",
          output: labOffline ? null : "Events injected: 1", error_code: labOffline ? "DEVICE_OFFLINE" : null,
          executed_at: daysAgo(day, 7, 33 + index * 2),
        });
      }
      if (day % 6 === 3 && index === 1) {
        items.push({
          id: id++, board: asIntentBoard(board), user: { id: users[1].id, email: users[1].email },
          command_key: "volume_set", resolved_command: "cmd media_session volume --stream 3 --set 99", version_used: board.version_detail?.code ?? "A11",
          status: "failed", source: "google_home", output: null, error_code: "INVALID_ARGUMENT",
          executed_at: daysAgo(day, 12, 15),
        });
      }
      items.push({
        id: id++, board: asIntentBoard(board), user: null,
        command_key: "screen_off", resolved_command: "input keyevent KEYCODE_SLEEP", version_used: board.version_detail?.code ?? "A11",
        status: labOffline ? "failed" : day === 0 ? "pending" : "success", source: "home_assistant",
        output: labOffline ? null : "", error_code: labOffline ? "DEVICE_OFFLINE" : null,
        executed_at: daysAgo(day, 21, 0 + index),
      });
    });
  }
  return items.sort((a, b) => b.executed_at.localeCompare(a.executed_at));
};

export const intents: Intent[] = buildIntents();
