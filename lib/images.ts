// Photos in /public/images. These are free stock photos (Unsplash License: free for
// commercial use, no attribution required) until the restaurant has its own photography.
// To swap one, replace the file or point `src` at a new one. Set `src: null` to show a styled panel instead.
//   dish.jpg   Keesha's Kitchen   https://unsplash.com/photos/woC24wGXsQ8
//   lounge.jpg Egor Myznik        https://unsplash.com/photos/WdWmF-FOupU
//   bar.jpg    David Utt          https://unsplash.com/photos/e0b8PfBJAJs
export type ImageKey = 'dining' | 'lounge' | 'bar' | 'dish' | 'cocktail' | 'exterior' | 'chef';

export const images: Record<ImageKey, { src: string | null; label: string; alt: string }> = {
  dining:   { src: null, label: 'Dining room', alt: 'The candlelit dining room at Velvet Palms' },
  lounge:   { src: '/images/lounge.jpg', label: 'The lounge', alt: 'Dark green chesterfield booths in a low-lit lounge' },
  bar:      { src: '/images/bar.jpg', label: 'The bar', alt: 'A bartender pouring a drink at a dimly lit bar' },
  dish:     { src: '/images/dish.jpg', label: 'From the kitchen', alt: 'Jollof rice topped with suya-spiced chicken skewers' },
  cocktail: { src: null, label: 'Cocktails', alt: 'A signature Velvet Palms cocktail' },
  exterior: { src: null, label: 'Exterior', alt: 'The entrance to Velvet Palms in Awka' },
  chef:     { src: null, label: 'The kitchen', alt: 'The Velvet Palms kitchen team at work' },
};
