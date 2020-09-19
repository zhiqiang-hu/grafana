import { SelectableValue } from './select';
import { Observable } from 'rxjs';

/**
 * The channel id is defined as:
 *
 *   ${scope}/${namespace}/${path}
 *
 * The scope drives how the namespace is used and controlled
 */
export enum LiveChannelScope {
  DataSource = 'ds', // namespace = data source ID
  Plugin = 'plugin', // namespace = plugin name (singleton works for apps too)
  Grafana = 'grafana', // namespace = feature
}

/**
 * @experimental
 */
export interface LiveChannelConfig<T = any> {
  /**
   * The path definition.  either static, or it may contain variables identifed with {varname}
   */
  path: string;

  /**
   * An optional description for the channel
   */
  description?: string;

  /**
   * When variables exist, this list will identify each one
   */
  variables?: Array<SelectableValue<string>>;

  /**
   * The channel keeps track of who else is connected to the same channel
   */
  hasPresense?: boolean;

  /**
   * This method will be defined if it is possible to publish in this channel.
   * The function will return true/false if the current user can publish
   */
  canPublish?: () => boolean;

  /** convert the stream message into a message that should be broadcast */
  processMessage?: (msg: any) => T;
}

/**
 * @experimental
 */
export interface LiveChannelStatus {
  /**
   * unix millies timestamp for the last status change
   */
  timestamp: number;

  /**
   * flag if the channel is activly connected to the channel.
   * This may be false while the connections get established or if the network is lost
   * As long as the `shutdown` flag is not set, the connection will try to reestablish
   */
  connected: boolean;

  /**
   * Indicate that the channel will not recived any updates and should be discarded
   */
  shutdown?: any;

  /**
   * The last error.
   *
   * This will remain in the status until a new message is succesfully recieved from the channel
   */
  error?: any;
}

/**
 * @experimental
 */
export interface LiveChannelPresense {
  action: 'join' | 'leave';
  user: any;
}

/**
 * @experimental
 */
export interface LiveChannel<TMessage = any, TPublish = any> {
  /** The fully qualified channel id: ${scope}/${namespace}/${path} */
  id: string;

  /** The scope for this channel */
  scope: LiveChannelScope;

  /** datasourceId/plugin name/feature depending on scope */
  namespace: string;

  /** additional qualifier */
  path: string;

  /** Unix timestamp for when the channel connected */
  opened: number;

  /** Static definition of the channel definition.  This may describe the channel usage */
  config?: LiveChannelConfig;

  /**
   * Get the channel status
   */
  getStatus: () => Observable<LiveChannelStatus>;

  /**
   * Get the stream of events and
   */
  getStream: () => Observable<TMessage>;

  /**
   * Indication of the presense indicator.
   *
   * NOTE: This feature is supported by a limited set of channels
   */
  getPresense?: () => Observable<LiveChannelPresense>;

  /**
   * Write a message into the channel
   *
   * NOTE: This feature is supported by a limited set of channels
   */
  publish?: (msg: TPublish) => Promise<any>;

  /**
   * This will close and terminate all streams for this channel
   */
  disconnect: () => void;
}

/**
 * @experimental
 */
export interface LiveChannelSupport {
  /**
   * Get the channel handler for the path, or throw an error if invalid
   */
  getChannelConfig(path: string): LiveChannelConfig | undefined;

  /**
   * Return a list of supported channels
   */
  getSupportedPaths(): LiveChannelConfig[];
}
