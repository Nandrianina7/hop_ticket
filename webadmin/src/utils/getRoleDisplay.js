export const getRoleDisplay = (role) => {
  switch (role) {
    case 'organizer':
      return 'Diffuseur de cinéma';
    case 'event_organizer':
      return "Organisateur d'événement";
    default:
      return role;
  }
};
