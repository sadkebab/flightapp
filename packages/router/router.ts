
import { VercelRequest, VercelResponse } from '@vercel/node'

type EdgeFunction = (req: VercelRequest, res: VercelResponse) => void
type RouterResolver = (fn: EdgeFunction) => void
type Method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH' | 'HEADERS' | 'OPTIONS'
type TRouter = {
  [key in Lowercase<Method>]: RouterResolver
}

interface IRouter extends TRouter {
  parse: (req: VercelRequest, res: VercelResponse) => void
}

export class Router implements IRouter {
  private get_: EdgeFunction | undefined
  private post_: EdgeFunction | undefined
  private delete_: EdgeFunction | undefined
  private put_: EdgeFunction | undefined
  private patch_: EdgeFunction | undefined
  private headers_: EdgeFunction | undefined
  private options_: EdgeFunction | undefined

  get(fn: EdgeFunction) {
    this.get_ = fn
    return this
  }

  post(fn: EdgeFunction) {
    this.post_ = fn
    return this
  }

  delete(fn: EdgeFunction) {
    this.delete_ = fn
    return this
  }

  put(fn: EdgeFunction) {
    this.put_ = fn
    return this
  }

  patch(fn: EdgeFunction) {
    this.patch_ = fn
    return this
  }

  headers(fn: EdgeFunction) {
    this.headers_ = fn
    return this
  }

  options(fn: EdgeFunction) {
    this.options_ = fn
    return this
  }

  parse(req: VercelRequest, res: VercelResponse) {
    const method = req.method || ''
    $witch(method)
      .case('GET', () => { this.get_ && this.get_(req, res) })
      .case('POST', () => { this.post_ && this.post_(req, res) })
      .case('DELETE', () => { this.delete_ && this.delete_(req, res) })
      .case('PUT', () => { this.put_ && this.put_(req, res) })
      .case('PATCH', () => { this.patch_ && this.patch_(req, res) })
      .case('HEADERS', () => { this.headers_ && this.headers_(req, res) })
      .case('OPTIONS', () => { this.options_ && this.options_(req, res) })
      .default(() => res.status(405).json({ message: 'Method not allowed' }))
  }
}

type MatchFunction<S> = (switch_: S, case_: S | S[]) => boolean | void;

function $witch<T>(switch_: T, break_: boolean = false) {
  return {
    case: (case_: T | T[], fn: MatchFunction<T>) => {
      if (
        case_ === switch_ ||
        (Array.isArray(case_) && case_.indexOf(switch_) !== -1)
      ) {
        break_ ||= !fn(switch_, case_);
      }
      return $witch(switch_, break_);
    },

    default: (fn: Function) => {
      if (!break_) fn();
    }
  };
}