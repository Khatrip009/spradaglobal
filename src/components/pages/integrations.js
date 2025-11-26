// src/components/pages/integrations.js
// Robust BaseCrudService used by HomePage.jsx and other pages.
// Exports:
//  - BaseCrudService (class, instance methods: list, get, create, update, delete)
//  - getAll(resource, params)   // static-style helper many components expect
//  - getOne(resource, id)
//  - createOne(resource, body)
//  - updateOne(resource, id, body)
//  - deleteOne(resource, id)

// Adjust DEFAULT_BASE_URL to match your backend (or leave "/api" for proxied dev server)
const DEFAULT_BASE_URL = "/api";

function buildUrl(base, resource, id = "", params = {}) {
  const resourcePath = resource ? `/${resource}` : "";
  const idPath = id ? `/${id}` : "";
  const qs = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : "";
  return `${base}${resourcePath}${idPath}${qs}`;
}

export class BaseCrudService {
  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // remove trailing slash
  }

  async list(resource, params = {}) {
    const url = buildUrl(this.baseUrl, resource, "", params);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to list ${resource}: ${res.status} ${res.statusText}`);
    return res.json();
  }

  async get(resource, id) {
    const url = buildUrl(this.baseUrl, resource, id);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to get ${resource}/${id}: ${res.status} ${res.statusText}`);
    return res.json();
  }

  async create(resource, body) {
    const url = buildUrl(this.baseUrl, resource);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Failed to create ${resource}: ${res.status} ${res.statusText}`);
    return res.json();
  }

  async update(resource, id, body) {
    const url = buildUrl(this.baseUrl, resource, id);
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Failed to update ${resource}/${id}: ${res.status} ${res.statusText}`);
    return res.json();
  }

  async delete(resource, id) {
    const url = buildUrl(this.baseUrl, resource, id);
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete ${resource}/${id}: ${res.status} ${res.statusText}`);
    return res.json();
  }
}

// ----- Static-style helpers many components expect -----

/**
 * getAll(resource, params)
 * Example usage in components: BaseCrudService.getAll('services').then(...)
 * This helper uses the default base URL and falls back to a small mock if fetch fails.
 */
export async function getAll(resource, params = {}) {
  const svc = new BaseCrudService();
  try {
    return await svc.list(resource, params);
  } catch (err) {
    console.warn(`getAll(${resource}) failed:`, err);
    // Optional: return small mock so UI can render in dev without backend
    return getMockFor(resource);
  }
}

export async function getOne(resource, id) {
  const svc = new BaseCrudService();
  try {
    return await svc.get(resource, id);
  } catch (err) {
    console.warn(`getOne(${resource}, ${id}) failed:`, err);
    return null;
  }
}

export async function createOne(resource, body) {
  const svc = new BaseCrudService();
  return svc.create(resource, body);
}

export async function updateOne(resource, id, body) {
  const svc = new BaseCrudService();
  return svc.update(resource, id, body);
}

export async function deleteOne(resource, id) {
  const svc = new BaseCrudService();
  return svc.delete(resource, id);
}

// Minimal mock data to make the home page render if the API isn't available.
// Extend this to match your components' expected shape.
function getMockFor(resource) {
  switch (resource) {
    case "services":
      return [
        { id: 1, title: "Mock Service A", description: "Placeholder description A", image: "/images/mock-a.jpg" },
        { id: 2, title: "Mock Service B", description: "Placeholder description B", image: "/images/mock-b.jpg" }
      ];
    case "posts":
    case "blogs":
      return [
        { id: 1, title: "Mock Post 1", excerpt: "This is an example post used when API is offline." },
        { id: 2, title: "Mock Post 2", excerpt: "Second example post." }
      ];
    case "products":
      return [
        { id: 1, name: "Mock Product", price: 99.0, image: "/images/prod-mock.jpg" }
      ];
    default:
      return [];
  }
}

// Provide default export for backwards compatibility if some modules do:
// import BaseCrudService from './integrations';
export default BaseCrudService;
