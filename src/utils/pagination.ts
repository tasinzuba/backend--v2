export const paginate = (page = 1, limit = 10) => {
    const p = Math.max(1, parseInt(String(page)) || 1);
    const l = Math.min(100, Math.max(1, parseInt(String(limit)) || 10));
    return { skip: (p - 1) * l, take: l };
};
