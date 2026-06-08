const API_BASE = "/api/users";

// GET USERS
export async function getUsersApi({
  page,
  archived,
  name,
  role,
  year,
}) {

  const params =
    new URLSearchParams();

  params.set("page", page);

  params.set(
    "archived",
    archived
  );

  if (name) {
    params.set("name", name);
  }

  if (role) {
    params.set("role", role);
  }

  if (year) {
    params.set("year", year);
  }

  const response = await fetch(
    `${API_BASE}?${params.toString()}`
  );

  const result =
    await response.json();

  if (!response.ok) {

    throw new Error(
      result.message ||
      "Failed to fetch users"
    );
  }

  return result;
}

// ARCHIVE USER
export async function archiveUserApi(id) {

  const response = await fetch(
    `${API_BASE}/${id}/archive`,
    {
      method: "PATCH",
    }
  );

  const result =
    await response.json();

  if (!response.ok) {

    throw new Error(
      result.message ||
      "Failed to archive user"
    );
  }

  return result;
}

// RESTORE USER
export async function restoreUserApi(id) {

  const response = await fetch(
    `${API_BASE}/${id}/restore`,
    {
      method: "PATCH",
    }
  );

  const result =
    await response.json();

  if (!response.ok) {

    throw new Error(
      result.message ||
      "Failed to restore user"
    );
  }

  return result;
}

// UPDATE USER
export async function updateUserApi(
  id,
  data
) {

  const response = await fetch(
    `${API_BASE}/${id}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(data),
    }
  );

  const result =
    await response.json();

  if (!response.ok) {

    throw new Error(
      result.message ||
      "Failed to update user"
    );
  }

  return result;
}