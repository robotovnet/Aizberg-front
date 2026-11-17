// @ts-ignore
export const IMG_PATH = `${import.meta.env.VITE_API_URL}/storage/userpics/`;
export const IMG_TC_PATH = `${import.meta.env.VITE_API_URL}/storage/icons_tc/`;
export const IMG_SECTION_PATH = `${import.meta.env.VITE_API_URL}/storage/thumbnail_catalog_sections/`;
export const DEFAULT_PIC = `${import.meta.env.VITE_API_URL}/storage/images/dashboard/staff/userpic_default.svg`;

/**
 * Безопасно получает API URL из переменных окружения
 * @returns API URL или пустую строку, если переменная не определена
 */
export const getApiUrl = (): string => {
	const apiUrl = import.meta.env.VITE_API_URL;
	
	return typeof apiUrl == 'string' ? apiUrl : '';
};

/**
 * Безопасно получает Docker API URL из переменных окружения
 * @returns Docker API URL или пустую строку, если переменная не определена
 */
export const getDockerApiUrl = (): string => {
	const dockerApiUrl = import.meta.env.VITE_DOCKER_API_URL;
	
	return typeof dockerApiUrl == 'string' ? dockerApiUrl : '';
};

/**
 * Разделы каталога «матрицы» (имена с бэкенда): прайс для 1С, тип матрицы и т.п.
 * Задаются в VITE_MATRIX_SECTIONS через запятую; если переменная пуста, функции матриц скрыты.
 */
export const MATRIX_SECTIONS: string[] = String(import.meta.env.VITE_MATRIX_SECTIONS || '')
	.split(',')
	.map(name => name.trim())
	.filter(Boolean);

export const ADDING_METHOD_ALL = 'all';
export const ADDING_METHOD_PRESET = 'preset';
export const ADDING_METHOD_MANUAL = 'manual';

/**
 * Удаляет поддомен из URL, оставляя только домен первого уровня
 * @param url - URL для обработки
 * @returns URL без поддомена
 */
export const removeSubdomain = (url: string): string => {
	if (!url) return url;
	
	try {
		const urlObj = new URL(url);
		const hostname = urlObj.hostname;
		
		// Разбиваем hostname на части
		const parts = hostname.split('.');
		
		// Если частей меньше 2, возвращаем исходный URL
		if (parts.length < 2) return url;
		
		// Для доменов второго уровня (например, example.com)
		if (parts.length === 2) {
			urlObj.hostname = hostname;
		} else {
			// Для доменов с поддоменами берем последние 2 части
			const domain = parts.slice(-2).join('.');
			urlObj.hostname = domain;
		}
		
		return urlObj.toString();
	} catch (error) {
		// Если URL некорректный, возвращаем исходную строку
		return url;
	}
};
