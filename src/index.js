import React, { Children, Component, PropTypes } from 'react'

export class Orientation extends Component {
  render () {
    const { orientation, children, className } = this.props
    return (
      <div className={`${className} react-orientation react-orientation--${orientation}`}>
        {children}
      </div>
    )
  }
}

Orientation.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  orientation: PropTypes.oneOf(['portrait', 'landscape']),
  alwaysRender: PropTypes.bool
}

Orientation.defaultProps = {
  className: '',
  alwaysRender: true
}

const noop = () => false

const lock = window.screen.lockOrientation ||
  window.screen.mozLockOrientation ||
  window.screen.msLockOrientation ||
  ((orientation) => {
    const { screen } = window
    if (screen.orientation && typeof screen.orientation.lock === 'function') {
      return window.screen.orientation.lock(orientation)
    } else {
      return new Promise((resolve, reject) => reject())
    }
  })

export default class DeviceOrientation extends Component {

  constructor (props) {
    super(props)
    this.lockOrientation(props)
    this.onOrientationChange = this.onOrientationChange.bind(this)

    this.state = {
      orienation: null,
      type: null,
      angle: null
    }
  }

  componentWillMount () {
    this.onOrientationChange(null)
  }

  componentDidMount () {
    console.log('DeviceOrientation', 'componentDidMount')
    if ('onchange' in window.screen.orientation) {
      console.log('Using screen.orientation.onchange')
      window.screen.orientation.addEventListener('change', this.onOrientationChange)
    } else if ('onorientationchange' in window) {
      console.log('Using window.onorientationchange')
      window.addEventListener('orientationchange', this.onOrientationChange)
    } else {
      console.warn('No orientationchange events')
    }
  }

  componentWillUnmount () {
    console.log('DeviceOrientation', 'componentWillUnmount')
    if ('onchange' in window.screen.orientation) {
      console.log('Removing screen.orientation.onchange')
      window.screen.orientation.removeEventListener('change', this.onOrientationChange)
    } else if ('onorientationchange' in window) {
      console.log('Removing window.onorientationchange')
      window.removeEventListener('orientationchange', this.onOrientationChange)
    }
  }

  onOrientationChange (event) {
    const onOrientationChange = this.props.onOrientationChange || noop
    const [orientation, type] = window.screen.orientation.type.split('-')
    const { angle } = window.screen.orientation
    this.setState({
      orientation,
      type,
      angle
    })
    onOrientationChange(orientation, type, angle)
  }

  lockOrientation ({lockOrientation}) {
    if (typeof lockOrientation !== 'string') {
      return
    }
    const onLockOrientation = this.props.onLockOrientation || noop
    return lock(lockOrientation).then(function () {
      onLockOrientation(true)
    }).catch(function () {
      onLockOrientation(false)
    })
  }

  render () {
    const { children, className } = this.props
    return (
      <div className={`${className}`}>
        {children}
      </div>
    )
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/screen/lockOrientation
const LOCK_ORIENTATIONS = [
  'portrait-primary',
  'portrait-secondary',
  'landscape-primary',
  'landscape-secondary',
  'portrait',
  'landscape',
  'default'
]

const isOrientation = (props, propName, componentName, location, propFullName) => {
  const propValue = props[propName]
  if (propValue.type !== Orientation) {
    return new Error(`Invalid ${location} '${propFullName}' supplied to '${componentName}', expected 'Orientation' component.`)
  }
}

DeviceOrientation.propTypes = {
  children: PropTypes.oneOfType([
    isOrientation,
    PropTypes.arrayOf(isOrientation)
  ]).isRequired,
  className: PropTypes.string,
  lockOrientation: PropTypes.oneOfType([
    PropTypes.oneOf(LOCK_ORIENTATIONS),
    PropTypes.arrayOf(PropTypes.oneOf(LOCK_ORIENTATIONS))
  ]),
  onLockOrientation: PropTypes.func,
  onOrientationChange: PropTypes.func
}

DeviceOrientation.defaultProps = {
  className: ''
}
