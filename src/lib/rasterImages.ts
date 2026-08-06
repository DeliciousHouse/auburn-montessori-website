import type { ImageMetadata } from 'astro';
import carouselSlide1 from '../assets/carousel/slide-1.webp';
import carouselSlide2 from '../assets/carousel/slide-2.webp';
import carouselSlide3 from '../assets/carousel/slide-3.webp';
import carouselSlide4 from '../assets/carousel/slide-4.webp';
import carouselSlide5 from '../assets/carousel/slide-5.webp';
import asmaJaved from '../assets/educators/asma-javed.webp';
import charleneKam from '../assets/educators/charlene-kam.webp';
import emmaStevenson from '../assets/educators/emma-stevenson.webp';
import janiceSagar from '../assets/educators/janice-sagar.webp';
import maciDemoras from '../assets/educators/maci-demoras.webp';
import patrickTousley from '../assets/educators/patrick-tousley.webp';
import rahmaZiyad from '../assets/educators/rahma-ziyad.webp';
import samPrice from '../assets/educators/sam-price.webp';
import argentinaPresentation from '../assets/programs/preschool/argentina-presentation.webp';
import foldingWork from '../assets/programs/preschool/folding-work.webp';
import teacherChild from '../assets/programs/preschool/teacher-child.webp';
import groupLessonRug from '../assets/programs/elementary/group-lesson-rug.webp';
import mapPuzzle from '../assets/programs/elementary/map-puzzle.webp';

const rasterImages: Record<string, ImageMetadata> = {
  '/images/carousel/slide-1.webp': carouselSlide1,
  '/images/carousel/slide-2.webp': carouselSlide2,
  '/images/carousel/slide-3.webp': carouselSlide3,
  '/images/carousel/slide-4.webp': carouselSlide4,
  '/images/carousel/slide-5.webp': carouselSlide5,
  '/images/educators/asma-javed.webp': asmaJaved,
  '/images/educators/charlene-kam.webp': charleneKam,
  '/images/educators/emma-stevenson.webp': emmaStevenson,
  '/images/educators/janice-sagar.webp': janiceSagar,
  '/images/educators/maci-demoras.webp': maciDemoras,
  '/images/educators/patrick-tousley.webp': patrickTousley,
  '/images/educators/rahma-ziyad.webp': rahmaZiyad,
  '/images/educators/sam-price.webp': samPrice,
  '/images/programs/preschool/argentina-presentation.webp': argentinaPresentation,
  '/images/programs/preschool/folding-work.webp': foldingWork,
  '/images/programs/preschool/teacher-child.webp': teacherChild,
  '/images/programs/elementary/group-lesson-rug.webp': groupLessonRug,
  '/images/programs/elementary/map-puzzle.webp': mapPuzzle
};

export const getRasterImage = (path: string) => {
  const image = rasterImages[path];
  if (!image) throw new Error(`Missing optimized raster asset for ${path}`);
  return image;
};
