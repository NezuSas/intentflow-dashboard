import { API_URL } from "@/config/api";
import { ApiClient } from "@/core/http/ApiClient";

import { AuthService } from "@/features/auth/application/AuthService";
import { JwtAuthTokenManager } from "@/features/auth/application/JwtAuthTokenManager";
import { AuthApiRepository } from "@/features/auth/infrastructure/AuthApiRepository";
import { BrowserAuthSessionStorage } from "@/features/auth/infrastructure/BrowserAuthSessionStorage";
import { BrowserAuthSessionEvents } from "@/features/auth/infrastructure/BrowserAuthSessionEvents";
import { AuthenticatedFetcher } from "@/features/auth/infrastructure/AuthenticatedFetcher";

import { BoardService } from "@/features/boards/application/BoardService";
import { BoardApiRepository } from "@/features/boards/infrastructure/BoardApiRepository";

import { ClientService } from "@/features/clients/application/ClientService";
import { ClientApiRepository } from "@/features/clients/infrastructure/ClientApiRepository";

import { CommandService } from "@/features/commands/application/CommandService";
import { CommandApiRepository } from "@/features/commands/infrastructure/CommandApiRepository";

import { DashboardService } from "@/features/dashboard/application/DashboardService";
import { DashboardApiRepository } from "@/features/dashboard/infrastructure/DashboardApiRepository";

import { IntentService } from "@/features/intents/application/IntentService";
import { IntentApiRepository } from "@/features/intents/infrastructure/IntentApiRepository";

import { SubscriptionService } from "@/features/subscriptions/application/SubscriptionService";
import { SubscriptionPlanApiRepository } from "@/features/subscriptions/infrastructure/SubscriptionPlanApiRepository";
import { ClientSubscriptionApiRepository } from "@/features/subscriptions/infrastructure/ClientSubscriptionApiRepository";

import { UserService } from "@/features/users/application/UserService";
import { UserApiRepository } from "@/features/users/infrastructure/UserApiRepository";

import { VersionService } from "@/features/versions/application/VersionService";
import { VersionApiRepository } from "@/features/versions/infrastructure/VersionApiRepository";

// Authentication
const authRepository =
  new AuthApiRepository();

const authStorage =
  new BrowserAuthSessionStorage();

const authEvents =
  new BrowserAuthSessionEvents();

export const authTokenManager =
  new JwtAuthTokenManager(
    authRepository,
    authStorage
  );

export const authService =
  new AuthService(
    authRepository,
    authTokenManager,
    authEvents
  );

// Authenticated HTTP transport
const authenticatedFetcher =
  new AuthenticatedFetcher(
    authTokenManager,
    authEvents,
    (url, options) =>
      fetch(url, options)
  );

export const httpClient =
  new ApiClient(
    API_URL,
    (url, options) =>
      authenticatedFetcher.fetch(
        url,
        options
      )
  );

// Boards
const boardRepository =
  new BoardApiRepository(httpClient);

export const boardService =
  new BoardService(boardRepository);

// Clients
const clientRepository =
  new ClientApiRepository(httpClient);

export const clientService =
  new ClientService(clientRepository);

// Commands
const commandRepository =
  new CommandApiRepository(httpClient);

export const commandService =
  new CommandService(commandRepository);

// Dashboard
const dashboardRepository =
  new DashboardApiRepository(httpClient);

export const dashboardService =
  new DashboardService(
    dashboardRepository
  );

// Intents
const intentRepository =
  new IntentApiRepository(httpClient);

export const intentService =
  new IntentService(intentRepository);

// Subscriptions
const subscriptionPlanRepository =
  new SubscriptionPlanApiRepository(
    httpClient
  );

const clientSubscriptionRepository =
  new ClientSubscriptionApiRepository(
    httpClient
  );

export const subscriptionService =
  new SubscriptionService(
    subscriptionPlanRepository,
    clientSubscriptionRepository
  );

// Users
const userRepository =
  new UserApiRepository(httpClient);

export const userService =
  new UserService(userRepository);

// Versions
const versionRepository =
  new VersionApiRepository(httpClient);

export const versionService =
  new VersionService(versionRepository);
