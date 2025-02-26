import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { Box, Button, Card, CardContent, CardHeader, Checkbox, FormControlLabel, IconButton, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { ServiceStructure, SubService } from '../../utils/types';
import { ValidationError } from './BookingSystem';

const ScrollContainer = styled(Box)({
  display: 'flex',
  gap: '8px',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
  paddingBottom: '8px'
});

const NavButton = styled(IconButton)({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  backgroundColor: 'white',
  boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  '&:hover': { backgroundColor: '#f5f5f5' }
});

const ServiceButton = styled(Button, {
  shouldForwardProp: (prop) => !['isSelected', 'hasCheckedServices'].includes(prop as string)
})<{ isSelected?: boolean; hasCheckedServices?: boolean }>(({ isSelected, hasCheckedServices }) => ({
  minWidth: '120px',
  flexShrink: 0,
  borderColor: '#000',
  backgroundColor: isSelected 
    ? '#000' 
    : hasCheckedServices 
    ? '#666' 
    : 'transparent',
  color: (isSelected || hasCheckedServices) ? '#fff' : '#000',
  '&:hover': {
    backgroundColor: isSelected 
      ? '#222' 
      : hasCheckedServices 
      ? '#777' 
      : 'rgba(0,0,0,0.04)',
    borderColor: '#000'
  }
}));

const ProgressBar = styled(LinearProgress)({
  marginTop: '8px',
  height: 2,
  backgroundColor: '#e0e0e0',
  '& .MuiLinearProgress-bar': {
    backgroundColor: '#000'
  }
});

interface ServiceSelectionProps {
  services: ServiceStructure;
  selectedServices: SubService[];
  onServiceSelect: (services: SubService[]) => void;
  isExpanded: boolean;
  hasError?: boolean;  // Add this
  errorStyle?: React.CSSProperties;  // Add this
}

export default function ServiceSelection({ services, selectedServices, onServiceSelect, isExpanded, hasError, errorStyle }: ServiceSelectionProps) {
  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      const updateProgress = () => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
        const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
        setScrollProgress(progress);
      };
      scrollElement.addEventListener('scroll', updateProgress);
      return () => scrollElement.removeEventListener('scroll', updateProgress);
    }
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount),
        behavior: 'smooth'
      });
    }
  };

  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft - (x - startX);
  };
  
return (
<Card 
  id="services"
  sx={errorStyle}
>
  {hasError && <ValidationError />}
  <CardHeader title="Select Services" sx={{ textAlign: 'center' }}/>
      <CardContent>
        <Box sx={{ position: 'relative' }}>
          <NavButton 
            onClick={() => handleScroll('left')} 
            sx={{ left: -16 }}
          >
            <KeyboardArrowLeft />
          </NavButton>

          <Box sx={{ overflow: 'hidden', mx: 2 }}>
            <ScrollContainer 
              ref={scrollRef}
              onMouseDown={(e) => {
                setIsDragging(true);
                setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
                setScrollLeft(scrollRef.current?.scrollLeft || 0);
              }}
              onMouseLeave={() => setIsDragging(false)}
              onMouseUp={() => setIsDragging(false)}
              onMouseMove={handleDrag}
            >
              {Object.keys(services).map((serviceKey) => {
                const hasSelectedServices = selectedServices.some(service => 
                  services[serviceKey].some(subService => 
                    subService.mainServiceId === service.mainServiceId
                  )
                );
                
                return (
                  <ServiceButton
                    key={serviceKey}
                    variant="outlined"
                    isSelected={selectedMain === serviceKey}
                    hasCheckedServices={hasSelectedServices && selectedMain !== serviceKey}
                    onClick={() => setSelectedMain(selectedMain === serviceKey ? null : serviceKey)}
                  >
                    {serviceKey}
                  </ServiceButton>
                );
              })}
            </ScrollContainer>
            <ProgressBar variant="determinate" value={scrollProgress} />
          </Box>

          <NavButton 
            onClick={() => handleScroll('right')} 
            sx={{ right: -16 }}
          >
            <KeyboardArrowRight />
          </NavButton>
        </Box>

        {selectedMain && (
          <Box sx={{ mt: 2 }}>
            {services[selectedMain].map((subService: SubService) => {
              const isChecked = selectedServices.some(s => s.id === subService.id);
              return (
                <Box
                  key={subService.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: isChecked ? 'rgba(0,0,0,0.04)' : 'transparent'
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => {
                          onServiceSelect(
                            e.target.checked
                              ? [...selectedServices, subService]
                              : selectedServices.filter(s => s.id !== subService.id)
                          );
                        }}
                      />
                    }
                    label={subService.name}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ color: 'text.secondary' }}>{subService.duration}min</Box>
                    <Box sx={{ fontWeight: 500, minWidth: 60, textAlign: 'right' }}>
                      ${subService.price}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}