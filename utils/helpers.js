function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueSlug(text, checkFn, excludeId = null) {
  let slug = slugify(text);
  let counter = 1;
  let exists = await checkFn(slug, excludeId);

  while (exists) {
    slug = `${slugify(text)}-${counter}`;
    exists = await checkFn(slug, excludeId);
    counter++;
  }

  return slug;
}

function truncate(text, length = 100) {
  if (!text) return '';
  const stripped = text.replace(/<[^>]*>/g, '');
  if (stripped.length <= length) return stripped;
  return stripped.substring(0, length).trim() + '...';
}

function paginate(total, page, perPage) {
  const totalPages = Math.ceil(total / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const offset = (currentPage - 1) * perPage;
  return { totalPages, currentPage, offset, perPage, total };
}

module.exports = { slugify, generateUniqueSlug, truncate, paginate };
