import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  titleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: '0.5rem 1.5rem',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: `0 0 1rem ${theme.palette.grey[500]}`,
  },
  title: {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: theme.palette.common.black,
    letterSpacing: '0.2rem',
    margin: 0,
    position: 'relative',
  },
  box: {
    position: 'absolute',
    top: '-1rem',
    left: '-1rem',
    width: 'calc(100% + 2rem)',
    height: 'calc(100% + 2rem)',
    borderRadius: '2rem',
    border: `1rem solid ${theme.palette.grey[100]}`,
    zIndex: -1,
  }
}));

interface TitleProps {
    text: string;
}

const Title = (props: TitleProps) => {
  const classes = useStyles();

  return (
    <div className={classes.titleWrapper}>
      <div className={classes.box} />
      <h1 className={classes.title}>
        {props.text}
      </h1>
    </div>
  );
};

export default Title;
