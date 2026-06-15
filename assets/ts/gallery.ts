const imageSelector = 'img.gallery-image';

function setupImageLink(img: HTMLImageElement): HTMLElement {
    const parent = img.parentElement;
    const hasLink = parent?.tagName === 'A';

    if (hasLink) {
        parent!.classList.add('image-link');
        parent!.setAttribute('data-pswp-width', img.getAttribute('width')!);
        parent!.setAttribute('data-pswp-height', img.getAttribute('height')!);
        return parent!;
    }

    const link = document.createElement('a');
    link.href = img.src;
    link.setAttribute('class', 'image-link');
    link.setAttribute('target', '_blank');
    link.setAttribute('data-pswp-width', img.getAttribute('width')!);
    link.setAttribute('data-pswp-height', img.getAttribute('height')!);
    link.appendChild(img);
    return link;
}

function createFigure(img: HTMLImageElement): HTMLElement {
    const figure = document.createElement('figure');
    figure.classList.add('gallery-image');
    figure.style.setProperty('flex-grow', img.getAttribute('data-flex-grow') || '1');
    figure.style.setProperty('flex-basis', img.getAttribute('data-flex-basis') || '0');

    figure.appendChild(setupImageLink(img));

    const caption = img.getAttribute('alt')?.trim();
    if (caption) {
        const figcaption = document.createElement('figcaption');
        figcaption.innerText = caption;
        figure.appendChild(figcaption);
    }

    return figure;
}

function nodeHasText(node: Node): boolean {
    return (node.textContent || '').trim().length > 0;
}

function paragraphHasContent(paragraph: HTMLParagraphElement): boolean {
    return Array.from(paragraph.childNodes).some((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            return nodeHasText(node);
        }

        if (node instanceof HTMLBRElement) {
            return false;
        }

        if (node instanceof HTMLImageElement && node.matches(imageSelector)) {
            return false;
        }

        if (node instanceof HTMLAnchorElement && node.querySelector(imageSelector)) {
            return false;
        }

        return nodeHasText(node);
    });
}

function trimParagraphEdges(paragraph: HTMLParagraphElement) {
    while (paragraph.firstChild instanceof HTMLBRElement || (paragraph.firstChild?.nodeType === Node.TEXT_NODE && !nodeHasText(paragraph.firstChild))) {
        paragraph.firstChild.remove();
    }

    while (paragraph.lastChild instanceof HTMLBRElement || (paragraph.lastChild?.nodeType === Node.TEXT_NODE && !nodeHasText(paragraph.lastChild))) {
        paragraph.lastChild.remove();
    }
}

function splitParagraph(paragraph: HTMLParagraphElement): HTMLElement[] {
    const result: HTMLElement[] = [];
    let textParagraph = document.createElement('p');

    const flushTextParagraph = () => {
        trimParagraphEdges(textParagraph);

        if (!paragraphHasContent(textParagraph)) {
            textParagraph.textContent = '';
            return;
        }

        result.push(textParagraph);
        textParagraph = document.createElement('p');
    };

    for (const node of Array.from(paragraph.childNodes)) {
        const image = node instanceof HTMLImageElement && node.matches(imageSelector)
            ? node
            : node instanceof HTMLAnchorElement
                ? node.querySelector(imageSelector) as HTMLImageElement | null
                : null;

        if (image) {
            flushTextParagraph();
            result.push(createFigure(image));
            continue;
        }

        if (node instanceof HTMLBRElement && !paragraphHasContent(textParagraph)) {
            node.remove();
            continue;
        }

        textParagraph.appendChild(node);
    }

    flushTextParagraph();
    return result;
}

function wrapGallery(figures: HTMLElement[]) {
    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'gallery';

    const parentNode = figures[0].parentNode!;
    parentNode.insertBefore(galleryContainer, figures[0]);

    for (const figure of figures) {
        galleryContainer.appendChild(figure);
    }
}

export default (container: HTMLElement) => {
    const paragraphs = Array.from(container.querySelectorAll('p')) as HTMLParagraphElement[];

    for (const paragraph of paragraphs) {
        if (!paragraph.querySelector(imageSelector)) {
            continue;
        }

        const replacementNodes = splitParagraph(paragraph);
        if (!replacementNodes.length) {
            paragraph.remove();
            continue;
        }

        paragraph.replaceWith(...replacementNodes);
    }

    const figures = Array.from(container.querySelectorAll('figure.gallery-image')) as HTMLElement[];
    let currentGallery: HTMLElement[] = [];

    for (const figure of figures) {
        if (!currentGallery.length) {
            currentGallery = [figure];
        } else if (figure.previousElementSibling === currentGallery[currentGallery.length - 1]) {
            currentGallery.push(figure);
        } else {
            wrapGallery(currentGallery);
            currentGallery = [figure];
        }
    }

    if (currentGallery.length) {
        wrapGallery(currentGallery);
    }
};
