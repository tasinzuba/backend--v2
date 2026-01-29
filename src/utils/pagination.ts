export const paginate = (page = 1, limit = 10) => {
    const p = Math.max(1, Number(page));
    const l = Math.min(100, Math.max(1, Number(limit)));
    return { skip: (p - 1) * l, take: l };
};
