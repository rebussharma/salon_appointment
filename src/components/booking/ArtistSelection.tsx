import { KeyboardArrowLeft, KeyboardArrowRight, Person as PersonIcon } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
  styled
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Artist } from '../../utils/types';
import { ValidationError } from './BookingSystem';

const ScrollContainer = styled('div')<{ canFit: boolean }>(({ canFit }) => ({
  display: 'flex',
  gap: '16px',
  overflowX: 'auto',
  scrollBehavior: 'smooth',
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  paddingBottom: '5px',
  cursor: canFit ? 'default' : 'grab',
  '&:active': {
    cursor: canFit ? 'default' : 'grabbing'
  },
  justifyContent: canFit ? 'center' : 'flex-start',
  flexWrap: 'nowrap',
  padding: '8px 0'
}));

interface ArtistSelectionProps {
  availableArtists: Artist[];
  selectedArtist: string | null;
  onPersonSelect: (person: string) => void;
  isExpanded: boolean;  // Add this prop
  hasError?: boolean;  // Add this
  errorStyle?: React.CSSProperties;  // Add this
}

export default function ArtistSelection({
  availableArtists,
  selectedArtist,
  onPersonSelect,
  isExpanded, hasError,errorStyle
}: ArtistSelectionProps) {
  // Add useEffect to ensure artist section is visible when expanded
  useEffect(() => {
    if (isExpanded) {
      // If needed, add any initialization logic here
    }
  }, [isExpanded]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [canFit, setCanFit] = useState(true);

  const [artistColors] = useState<Record<string, string>>(() =>
    availableArtists.reduce((acc, artist) => ({
      ...acc,
      [artist.name]: `hsl(${Math.random() * 360}, 70%, 50%)`
    }), {})
  );
  

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        const hasOverflow = scrollRef.current.scrollWidth > scrollRef.current.clientWidth;
        setShowArrows(hasOverflow);
        setCanFit(!hasOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [availableArtists]);

const startDragging = (e: React.MouseEvent<HTMLDivElement>) => {
  setIsDragging(true);
  setStartX(e.pageX - scrollRef.current!.offsetLeft);
  setScrollLeft(scrollRef.current!.scrollLeft);
};

const stopDragging = () => {
  setIsDragging(false);
};

const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - scrollRef.current!.offsetLeft;
  const walk = (x - startX);
  scrollRef.current!.scrollLeft = scrollLeft - walk;
};

const handleScroll = (direction: 'left' | 'right') => {
  if (scrollRef.current) {
    const scrollAmount = 300;
    const currentScroll = scrollRef.current.scrollLeft;
    scrollRef.current.scrollTo({
      left: direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  }
};

return (
<Card 
  id="artists"
  sx={errorStyle}
>
  {hasError && <ValidationError />}   
   <CardHeader title="Choose An Artist" sx={{ textAlign:'center' }}/>
    <CardContent>
      <Box sx={{ position: 'relative' }}>
        {showArrows && (
          <IconButton
            onClick={() => handleScroll('left')}
            sx={{
              position: 'absolute',
              left: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper' }
            }}
          >
            <KeyboardArrowLeft />
          </IconButton>
        )}

        <Box sx={{ 
          overflow: 'hidden', 
          mx: showArrows ? 2 : 0,
        }}>
          <ScrollContainer
            ref={scrollRef}
            canFit={canFit}
            onMouseDown={canFit ? undefined : startDragging}
            onMouseLeave={canFit ? undefined : stopDragging}
            onMouseUp={canFit ? undefined : stopDragging}
            onMouseMove={canFit ? undefined : handleMouseMove}
          >
            {availableArtists.map((person) => (
              <Box 
                key={person.name} 
                sx={{ 
                  textAlign: 'center',
                  flex: '0 0 auto'
                }}
              >
                <IconButton
                  onClick={() => onPersonSelect(person.name)}
                  sx={{
                    width: 60,
                    height: 60,
                    backgroundColor: artistColors[person.name],
                    border: selectedArtist === person.name ? '2px solid #000000' : 'none',
                    '&:hover': {
                      backgroundColor: artistColors[person.name]
                    }
                  }}
                >
                  <PersonIcon sx={{ color: 'white' }} />
                </IconButton>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {person.name}
                </Typography>
              </Box>
            ))}
          </ScrollContainer>
        </Box>

        {showArrows && (
          <IconButton
            onClick={() => handleScroll('right')}
            sx={{
              position: 'absolute',
              right: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper' }
            }}
          >
            <KeyboardArrowRight />
          </IconButton>
        )}
      </Box>
    </CardContent>
  </Card>
);
}